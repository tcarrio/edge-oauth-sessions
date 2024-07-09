import { CallbackHandler } from '@eos/application/handlers/callback.handler';
import { LoginHandler } from '@eos/application/handlers/login.handler';
import { LogoutHandler } from '@eos/application/handlers/logout.handler';
import { ProxyHandler } from '@eos/application/handlers/proxy.handler';
import { AuthSessionMiddleware } from '@eos/application/middleware/auth-session.middleware';
import { BotScoringMiddleware } from '@eos/application/middleware/cloudflare/bot-scoring.middleware';
import { GeolocationMiddleware } from '@eos/application/middleware/cloudflare/geolocation.middleware';
import { merge } from '@eos/domain/functional/array';
import { memoize } from '@eos/domain/functional/memoize';
import { Env } from '@eos/infrastructure/cloudflare/@types/env';
import { AuthSessionManagerFactoryFactory } from '@eos/infrastructure/cloudflare/factories/auth-session-manager';
import { CloudflareConfigFactory } from '@eos/infrastructure/cloudflare/factories/config';
import { RouterConfigFactory } from '@eos/infrastructure/cloudflare/factories/router-config';
import { OpenIDConnectConfigFactory } from '@eos/infrastructure/open-id-connect/config';
import { OpenIDConnectClientFactory } from '@eos/infrastructure/open-id-connect/factory';
import { AutoRouter, AutoRouterType, withCookies } from 'itty-router';

export { DurableAuthSessionObject } from '@eos/infrastructure/cloudflare/durables/DurableAuthSessionObject';

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

const getRouter = memoize((env: Env): AutoRouterType => {
	const authSessionManagerFactory = AuthSessionManagerFactoryFactory.forEnv(env);
	const routerConfig = RouterConfigFactory.forEnv(env);
	const oidcConfig = OpenIDConnectConfigFactory.forEnv(env);
	const oidcClient = OpenIDConnectClientFactory.forEnv(env);
	const featureConfig = CloudflareConfigFactory.forEnv(env);

	// initialize all middlewares and return singleton router as necessary
	const router = AutoRouter({
		before: merge(
			[withCookies],
			featureConfig.geolocationEnabled ? [new GeolocationMiddleware().bind()] : [],
			featureConfig.botScoringEnabled ? [new BotScoringMiddleware().bind()] : []
		),
	});

	// authentication application routes
	router.get(routerConfig.logoutPath, new LogoutHandler(authSessionManagerFactory, routerConfig).bind());
	router.get(routerConfig.loginPath, new LoginHandler(oidcConfig, oidcClient).bind());
	router.get(routerConfig.callbackPath, new CallbackHandler(oidcConfig, oidcClient).bind());

	// proxy all remaining routes with Token Handler support
	router.all('*', new AuthSessionMiddleware(authSessionManagerFactory).bind(), new ProxyHandler().bind());

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
		return getRouter(env).fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
