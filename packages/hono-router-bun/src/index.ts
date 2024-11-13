import Database from 'bun:sqlite';
import { CallbackHandler } from '@eos/application/hono/handlers/callback.handler';
import { DynamicProxyHandler } from '@eos/application/hono/handlers/dynamic-proxy.handler';
import { LoginHandler } from '@eos/application/hono/handlers/login.handler';
import { LogoutHandler } from '@eos/application/hono/handlers/logout.handler';
import { AuthSessionMiddleware } from '@eos/application/hono/middleware/auth-session.middleware';
import { WithCookiesMiddleware } from '@eos/application/hono/middleware/with-cookies';
import { AssuredResources } from '@eos/domain/common/resources';
import { assertZ } from '@eos/domain/invariance';
import type { AuthSessionManagerFactory } from '@eos/domain/sessions/auth-session-manager';
import { WorkerCryptoUuidFactory } from '@eos/infrastructure/cloudflare/uuid/WorkerCryptoUuidFactory';
import { AuthSessionManager } from '@eos/infrastructure/common/auth-session-manager';
import { DateClockService } from '@eos/infrastructure/common/date-clock-service';
import { RouterConfigFactory } from '@eos/infrastructure/hono/router/config';
import { DynamicProxyConfigFactory } from '@eos/infrastructure/hono/router/dynamic-proxy-config-factory';
import { FetchHttpClient } from '@eos/infrastructure/http/fetch-http-client';
import { ResponseFormat } from '@eos/infrastructure/http/http-client';
import { OpenIDConnectConfigFactory } from '@eos/infrastructure/open-id-connect/config';
import { OpenIDConnectClientFactory } from '@eos/infrastructure/open-id-connect/factory';
import { SqliteCookieSecretRepository } from '@eos/infrastructure/persistence/bun/cookie-secret-repository';
import { SqliteSessionRepository } from '@eos/infrastructure/persistence/bun/session-repository';
import { SqliteConfigFactory } from '@eos/infrastructure/persistence/sqlite/config';
import { Hono } from 'hono';
import { z } from 'zod';

const routerFromEnv = async (env: unknown): Promise<Hono> => {
	const routerConfig = RouterConfigFactory.forEnv(env);
	const oidcConfig = OpenIDConnectConfigFactory.forEnv(env);
	const proxyConfig = DynamicProxyConfigFactory.forEnv(env);

	const sqliteConfig = SqliteConfigFactory.forEnv(env);
	const sqliteDb = new Database(sqliteConfig.file, {
		create: sqliteConfig.createIfNotExists,
	});
	const cookieSecretRepository = new SqliteCookieSecretRepository(sqliteDb, 'cookie_secrets' /* TODO: env config */);
	const sessionRepository = new SqliteSessionRepository(sqliteDb, 'sessions' /* TODO: env config */);

	// ensure all repositories are ready to roll
	await AssuredResources.prepare(cookieSecretRepository, sessionRepository);

	const uuidFactory = WorkerCryptoUuidFactory.instance();

	// TODO: Base URL for HttpClient
	const oidcAgentHttpClient = new FetchHttpClient({
		baseUrl: '',
		followRedirects: 0,
		responseFormat: ResponseFormat.JSON,
	});
	const oidcClient = new OpenIDConnectClientFactory(oidcAgentHttpClient).forEnv(env);

	const authSessionManager = new AuthSessionManager(sessionRepository, oidcClient, new DateClockService());
	const authSessionManagerFactory: AuthSessionManagerFactory = {
		forId: () => authSessionManager,
	};

	// TODO: Standard Hono factory to consolidate various feature sets like Cloudflare middleware along with the core components
	// initialize all middlewares and return singleton router as necessary
	const router = new Hono();

	// ensure cookie proxy availability
	router.use('*', new WithCookiesMiddleware().bind());

	// authentication application routes
	router.get(routerConfig.logoutPath, new LogoutHandler(authSessionManagerFactory, routerConfig).bind());
	router.get(routerConfig.loginPath, new LoginHandler(routerConfig, oidcConfig, oidcClient, cookieSecretRepository, uuidFactory).bind());
	router.get(routerConfig.callbackPath, new CallbackHandler(oidcConfig, oidcClient).bind());

	// proxy all remaining routes with Token Handler support
	router.all('*', new AuthSessionMiddleware(authSessionManagerFactory).bind(), new DynamicProxyHandler(proxyConfig).bind());

	return router;
};

const ServerOptionsSchema = z.object({
	BUN_SERVER_HOST: z.string().regex(/^[a-zA-Z0-9-]+$/),
	BUN_SERVER_PORT: z.string().regex(/^[1-9][0-9]+$/),
	NODE_ENV: z.enum(['production', 'development']).optional(),
});

assertZ(ServerOptionsSchema, Bun.env, 'Invalid server options from environment');

const router = await routerFromEnv(Bun.env);

// Bun! Run the proxy server!
Bun.serve({
	fetch: router.fetch.bind(router),
	port: Bun.env.BUN_SERVER_PORT,
	hostname: Bun.env.BUN_SERVER_HOST,
	development: Bun.env.NODE_ENV !== 'production',
	reusePort: false, // disallow overlapping port maps
});

console.log(`Server started at '${Bun.env.BUN_SERVER_HOST}:${Bun.env.BUN_SERVER_PORT}'. Waiting for requests...`);
