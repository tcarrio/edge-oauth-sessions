import { AutoRouter, AutoRouterType, withCookies } from 'itty-router';
import { Env } from './@types/env';
import { AuthSessionMiddleware } from './middleware/auth-session.middleware';
import { BotScoringMiddleware } from './middleware/bot-scoring.middleware';
import { GeolocationMiddleware } from './middleware/geolocation.middleware';
import { AuthSessionManager, AuthSessionManagerFactory } from './sessions/auth-session-manager';
import { LogoutHandler } from './handlers/logout.handler';
import { ProxyHandler } from './handlers/proxy.handler';

export { DurableAuthSessionObject } from './durables/DurableAuthSessionObject';

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

function asmfFactory(env: Env): AuthSessionManagerFactory {
	return {
		forId: (id: string) => {
			const durableObjectId = env.DURABLE_AUTH_SESSION_OBJECT.idFromName(id);

			return env.DURABLE_AUTH_SESSION_OBJECT.get(durableObjectId) as any as AuthSessionManager;
		},
	};
}

let router: AutoRouterType | null = null;
function getRouter(env: Env): AutoRouterType {
	if (router === null) {
		// initialize all middlewares and return singleton router as necessary
		router = AutoRouter();

		router.all('*', withCookies, new GeolocationMiddleware().bind(), new BotScoringMiddleware().bind());

		// explicit routes
		router.get('/logout', new LogoutHandler(asmfFactory(env)).bind());
		router.get('/login', new LoginHandler(asmfFactory(env)).bind());

		router.all('*', new AuthSessionMiddleware(asmfFactory(env)).bind(), new ProxyHandler().bind());
	}

	return router;
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
		return getRouter(env).fetch(request, env, ctx);
	},
} satisfies ExportedHandler<Env>;
