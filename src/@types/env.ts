import { DurableAuthSessionObject } from "../durables/DurableAuthSessionObject";

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
