import type { DurableAuthSessionObject } from '../durables/DurableAuthSessionObject';

/**
 * Associate bindings declared in wrangler.toml with the TypeScript type system
 */
export interface Env {
	// Router config
	ROUTER_COOKIE_KEY?: string;
	ROUTER_CALLBACK_PATH?: string;
	ROUTER_LOGIN_PATH?: string;
	ROUTER_LOGOUT_PATH?: string;

	// JWKS validation
	JWKS_URI: string;
	JWKS_CACHE_TIME_SECONDS: number;

	// OAuth config
	OAUTH_STRATEGY: string; // determines which OAuthClient implementation to use
	OAUTH_REFRESH_URI: string;
	OAUTH_REDIRECT_URI: string; // similar to ROUTER_CALLBACK_PATH, but full URL
	OAUTH_CLIENT_ID: string;
	OAUTH_CLIENT_SECRET: string;
	OAUTH_REFRESH_MAX_RETRIES: number;

	// Neon provider
	NEON_DATABASE_URI: string;
	NEON_DATABASE_SESSIONS_TABLE: string;

	// KV provider
	KV_KEY_PREFIX: string;

	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	KV_AUTH_SESSION: KVNamespace;
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
	// Example binding to a D1 database.
	D1_DATABASE: D1Database;
	D1_COOKIE_SECRET_TABLE_NAME: string;
}
