import { DurableObject } from 'cloudflare:workers';
import { Env } from "../@types/env";
import { JWKSet, jwksSetFactory } from '@eos/domain/open-id-connect/jwks';
import { AuthSessionManager } from '@eos/domain/sessions/auth-session-manager';
import { SessionCredentials } from '@eos/domain/sessions/session-credentials';
import { OpenIDConnectClientFactory } from '@eos/infrastructure/open-id-connect/factory';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { SessionState } from "@eos/domain/sessions/session-state";
import { DurableObjectStateSessionRepository } from '@eos/infrastructure/persistence/durable-objects/session-repository';
import { SessionRepository } from '@eos/domain/sessions/session-repository';

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject extends DurableObject<Env> implements AuthSessionManager {
	private readonly openIDConnectClient: OpenIDConnectClient;
	private readonly ttlMs: number;
	private readonly jwks: JWKSet | null = null;
	private readonly sessionRepository: SessionRepository;

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
	async authenticate(sessionId: string): Promise<SessionState | undefined> {
		const rawCredentials = await this.sessionRepository.findById(sessionId);

		if (!rawCredentials) {
			return undefined;
		}

		const credentials = new SessionCredentials(rawCredentials);

		const { accessToken, refreshToken } = credentials.parsed();
		if (typeof accessToken.payload?.exp !== 'number' || (accessToken.payload?.exp ?? 0) < Date.now()) {
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
