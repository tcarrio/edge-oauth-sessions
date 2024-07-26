import { DurableObject } from 'cloudflare:workers';
import { Env } from "../@types/env";
import { JWKSet, jwksSetFactory } from '@eos/domain/open-id-connect/jwks';
import { AuthSessionManager } from '@eos/domain/sessions/auth-session-manager';
import { HydratingSessionState, ISessionState } from '@eos/domain/sessions/session-state';
import { OpenIDConnectClientFactory } from '@eos/infrastructure/open-id-connect/factory';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { DurableObjectStateSessionRepository } from '@eos/infrastructure/persistence/durable-objects/session-repository';
import { SessionRepository } from '@eos/domain/sessions/session-repository';
import { time } from '@eos/domain/common/time';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject extends DurableObject<Env> implements AuthSessionManager {
	private readonly openIDConnectClient: OpenIDConnectClient;
	private readonly ttlMs: number;
	private readonly jwks: JWKSet | null = null;
	private readonly sessionRepository: SessionRepository;
	private readonly expirationBuffer = 60 * time.Second;

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

		this.openIDConnectClient = OpenIDConnectClientFactory.withFetchClient().forEnv(env);
		this.sessionRepository = new DurableObjectStateSessionRepository(ctx);
	}

	/**
	 * The Durable Object exposes an RPC method sayHello which will be invoked when when a Durable
	 *  Object instance receives a request from a Worker via the same method invocation on the stub
	 *
	 * @param name - The name provided to a Durable Object instance from a Worker
	 * @returns The greeting to be sent back to the Worker
	 */
	async authenticate(sessionId: string): Promise<ISessionState | undefined> {
		const rawCredentials = await this.sessionRepository.findById(sessionId);

		if (!rawCredentials) {
			return undefined;
		}

		const credentials = new HydratingSessionState(rawCredentials);

		const { accessToken, refreshToken } = credentials.parsed;

		const expirationDate = (typeof accessToken.exp !== 'number' || !accessToken?.exp) ? 0 : accessToken.exp;

		if ((Date.now() - this.expirationBuffer) > (expirationDate * time.Second)) {
			const newRawCredentials = await this.openIDConnectClient.refresh({ refresh_token: refreshToken });

			await this.sessionRepository.upsert(sessionId, newRawCredentials);

			return newRawCredentials;
		}

		return credentials.raw;
	}

	async logout(sessionId: string): Promise<void> {
		this.sessionRepository.delete(sessionId);
	}
}
