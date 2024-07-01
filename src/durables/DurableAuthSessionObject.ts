import { DurableObject } from 'cloudflare:workers';
import { Env } from "../@types/env";
import { JWKSet, jwksSetFactory } from '../oauth/jwks';
import { OAuthTokenRefresher } from '../oauth/token-refresher';
import { AuthSessionManager } from '../sessions/auth-session-manager';
import { RawSessionCredentials, SessionCredentials } from '../sessions/session-credentials';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject extends DurableObject<Env> implements AuthSessionManager {
	private oauthRefresher: OAuthTokenRefresher;
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

		this.oauthRefresher = new OAuthTokenRefresher(
			env.OAUTH_CLIENT_ID,
			env.OAUTH_CLIENT_SECRET,
			env.OAUTH_REFRESH_URI,
			env.OAUTH_REFRESH_MAX_RETRIES
		);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async authenticate(sessionId: string): Promise<RawSessionCredentials | undefined> {
		const rawCredentials = await this.ctx.storage.get<RawSessionCredentials>(sessionId);

		if (!rawCredentials) {
			return undefined;
		}

		const credentials = new SessionCredentials(rawCredentials);

		const { accessToken, refreshToken } = credentials.parsed();
		if (typeof accessToken.payload?.exp !== 'number' || (accessToken.payload?.exp ?? 0) < Date.now()) {
			const newRawCredentials = await this.oauthRefresher.refreshTokenWithRetries(refreshToken);

			await this.ctx.storage.put(sessionId, newRawCredentials);

			return newRawCredentials;
		}

		return credentials.raw;
	}

	async logout(sessionId: string): Promise<void> {
		this.ctx.storage.delete(sessionId);
	}
}
