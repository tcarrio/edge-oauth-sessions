import { CallbackHandler } from "@eos/application/hono/handlers/callback.handler";
import { LoginHandler } from "@eos/application/hono/handlers/login.handler";
import { LogoutHandler } from "@eos/application/hono/handlers/logout.handler";
import { PassthroughProxyHandler } from "@eos/application/hono/handlers/passthrough-proxy.handler";
import { AuthSessionMiddleware } from "@eos/application/hono/middleware/auth-session.middleware";
import { BotScoringMiddleware } from "@eos/application/hono/middleware/cloudflare/bot-scoring.middleware";
import { GeolocationMiddleware } from "@eos/application/hono/middleware/cloudflare/geolocation.middleware";
import { WithCookiesMiddleware } from "@eos/application/hono/middleware/with-cookies";
import { memoize } from "@eos/domain/functional/memoize";
import type { Env } from "@eos/infrastructure/cloudflare/@types/env";
import { CloudflareConfigFactory } from "@eos/infrastructure/cloudflare/config";
import { RouterConfigFactory } from "@eos/infrastructure/hono/router/config";
import { AuthSessionManagerFactoryFactory } from "@eos/infrastructure/cloudflare/sessions/auth-session-manager";
import { WorkerCryptoUuidFactory } from "@eos/infrastructure/cloudflare/uuid/WorkerCryptoUuidFactory";
import { FetchHttpClient } from "@eos/infrastructure/http/fetch-http-client";
import { ResponseFormat } from "@eos/infrastructure/http/http-client";
import { OpenIDConnectConfigFactory } from "@eos/infrastructure/open-id-connect/config";
import { OpenIDConnectClientFactory } from "@eos/infrastructure/open-id-connect/factory";
import { D1CookieSecretRepository } from "@eos/infrastructure/persistence/d1/cookie-secret-repository";
import { Hono } from "hono";
import { AssuredResources } from "@eos/domain/common/resources";

export { DurableAuthSessionObject } from "@eos/infrastructure/cloudflare/durables/DurableAuthSessionObject";

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

const getRouter = memoize(async (env: Env): Promise<Hono> => {
	const authSessionManagerFactory =
		AuthSessionManagerFactoryFactory.forEnv(env);
	const routerConfig = RouterConfigFactory.forEnv(env);
	const oidcConfig = OpenIDConnectConfigFactory.forEnv(env);
	const featureConfig = CloudflareConfigFactory.forEnv(env);
	const uuidFactory = WorkerCryptoUuidFactory.instance();

	// TODO: Base URL for HttpClient
	const oidcAgentHttpClient = new FetchHttpClient({
		baseUrl: "",
		followRedirects: 0,
		responseFormat: ResponseFormat.JSON,
	});

	const oidcClient = new OpenIDConnectClientFactory(oidcAgentHttpClient).forEnv(
		env,
	);

	const cookieSecretRepository = new D1CookieSecretRepository(
		env.D1_DATABASE,
		env.D1_COOKIE_SECRET_TABLE_NAME,
	);

	// ensure all repositories are ready to roll
	await AssuredResources.prepare(cookieSecretRepository);

	// initialize all middlewares and return singleton router as necessary
	const router = new Hono();

	// ensure cookie proxy availability
	router.use("*", new WithCookiesMiddleware().bind());

	if (featureConfig.geolocationEnabled) {
		router.use("*", new GeolocationMiddleware().bind());
	}
	if (featureConfig.botScoringEnabled) {
		router.use("*", new BotScoringMiddleware().bind());
	}

	// authentication application routes
	router.get(
		routerConfig.logoutPath,
		new LogoutHandler(authSessionManagerFactory, routerConfig).bind(),
	);
	router.get(
		routerConfig.loginPath,
		new LoginHandler(
			routerConfig,
			oidcConfig,
			oidcClient,
			cookieSecretRepository,
			uuidFactory,
		).bind(),
	);
	router.get(
		routerConfig.callbackPath,
		new CallbackHandler(oidcConfig, oidcClient).bind(),
	);

	// proxy all remaining routes with Token Handler support
	router.all(
		"*",
		new AuthSessionMiddleware(authSessionManagerFactory).bind(),
		new PassthroughProxyHandler().bind(),
	);

	return router;
});

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
		const router = await getRouter(env);

		return router.fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
