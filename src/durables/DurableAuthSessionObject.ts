import { DurableObject } from 'cloudflare:workers';
import { Env } from "../@types/env";
import { JWKSet, jwksSetFactory } from '../oauth/jwks';
import { AuthSessionManager } from '../sessions/auth-session-manager';
import { SessionCredentials } from '../sessions/session-credentials';
import { OAuthClientFactory } from '../oauth/factory';
import { OAuthClient, UserAuthenticationState } from '../oauth/client';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject extends DurableObject<Env> implements AuthSessionManager {
	private oauthClient: OAuthClient;
	private ttlMs: number;
	private jwks: JWKSet | null = null;

	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 */
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);

		this.ttlMs = env.JWKS_CACHE_TIME_SECONDS * 1000;
		this.jwks = jwksSetFactory(env.JWKS_URI, { cacheMaxAge: this.ttlMs });

		this.oauthClient = OAuthClientFactory.forStrategy(env.OAUTH_STRATEGY, {
			clientId: env.OAUTH_CLIENT_ID,
			clientSecret: env.OAUTH_CLIENT_SECRET,
			redirectUri: env.OAUTH_REFRESH_URI,
			retries: env.OAUTH_REFRESH_MAX_RETRIES
		});
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async authenticate(sessionId: string): Promise<UserAuthenticationState | undefined> {
		const rawCredentials = await this.ctx.storage.get<UserAuthenticationState>(sessionId);

		if (!rawCredentials) {
			return undefined;
		}

		const credentials = new SessionCredentials(rawCredentials);

		const { accessToken, refreshToken } = credentials.parsed();
		if (typeof accessToken.payload?.exp !== 'number' || (accessToken.payload?.exp ?? 0) < Date.now()) {
			const newRawCredentials = await this.oauthClient.refresh({ refreshToken });

			await this.ctx.storage.put(sessionId, newRawCredentials);

			return newRawCredentials;
		}

		return credentials.raw;
	}

	async logout(sessionId: string): Promise<void> {
		this.ctx.storage.delete(sessionId);
	}
}
