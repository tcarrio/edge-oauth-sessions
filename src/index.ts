import { DurableObject } from 'cloudflare:workers';
import { RawSessionCredentials, SessionCredentials } from './sessions/session-credentials';
import { MiddlewareManager } from './middleware/manager';
import { AuthSessionMiddleware } from './middleware/auth-session.middleware';
import { enrichRequestWithCookies } from './requests/cookies';
import { GeolocationMiddleware } from './middleware/geolocation.middleware';
import { BotScoringMiddleware } from './middleware/bot-scoring.middleware';
import { AuthSessionManager, AuthSessionManagerFactory } from './sessions/auth-session-manager';
import { ProxyMiddleware } from './middleware/proxy.middleware';
import { Jwks } from './jwt/jwks';
import { OAuthTokenRefresher } from './oauth/token-refresher';
import { Repository } from './@types/repository';
import { CachedRepository } from './oauth/cached-repository';
import { JwksRepository } from './oauth/jwks-repository';
import { createRemoteJWKSet } from 'jose';

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

/**
 * Associate bindings declared in wrangler.toml with the TypeScript type system
 */
export interface Env {
	JWKS_URI: string;
	JWKS_CACHE_TIME_SECONDS: number;

	OAUTH_REFRESH_URI: string;
	OAUTH_CLIENT_ID: string;
	OAUTH_CLIENT_SECRET: string;
	OAUTH_REFRESH_MAX_RETRIES: number;

	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	DURABLE_AUTH_SESSION_OBJECT: DurableObjectNamespace<DurableAuthSessionObject>;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject extends DurableObject<Env> implements AuthSessionManager {
	private jwksUri: string;
	private ttlMs: number;
	private oauthRefresher: OAuthTokenRefresher;
	private jwksRepository: Repository<Jwks>;
	private remoteJwksSet: ReturnType<typeof createRemoteJWKSet>|null = null;

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
		this.jwksUri = env.JWKS_URI;

		this.oauthRefresher = new OAuthTokenRefresher(
			env.OAUTH_CLIENT_ID,
			env.OAUTH_CLIENT_SECRET,
			env.OAUTH_REFRESH_URI,
			env.OAUTH_REFRESH_MAX_RETRIES
		);

		this.jwksRepository = new CachedRepository(new JwksRepository(env.JWKS_URI), env.JWKS_CACHE_TIME_SECONDS);
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

function asmfFactory(env: Env): AuthSessionManagerFactory {
	return {
		forId: (id: string) => {
			const durableObjectId = env.DURABLE_AUTH_SESSION_OBJECT.idFromName(id);

			return env.DURABLE_AUTH_SESSION_OBJECT.get(durableObjectId) as any as AuthSessionManager;
		},
	};
}

let middlewareManager: MiddlewareManager | null = null;

function getMiddlewareManager(env: Env): MiddlewareManager {
	if (!middlewareManager) {
		middlewareManager = new MiddlewareManager();
		middlewareManager.use(new BotScoringMiddleware());
		middlewareManager.use(new GeolocationMiddleware());
		middlewareManager.use(new AuthSessionMiddleware(asmfFactory(env)));
		middlewareManager.use(new ProxyMiddleware());
	}
	return middlewareManager;
}

export default {
	/**
	 * This is the standard fetch handler for a Cloudflare Worker
	 *
	 * @param request - The request submitted to the Worker from the client
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 * @param ctx - The execution context of the Worker
	 * @returns The response to be sent back to the client
	 */
	async fetch(request: Request, env: Env, ctx): Promise<Response> {
		return getMiddlewareManager(env).handle(enrichRequestWithCookies(request), new Response());
	},
} satisfies ExportedHandler<Env>;
