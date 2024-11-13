import { RouterConfig } from '@eos/application/router/config';
import { z } from 'zod';

const RouterConfigDefaults: Omit<RouterConfig, 'domain'> = {
	cookieKey: 'auth-session-id',
	callbackPath: '/auth/callback',
	loginPath: '/auth/login',
	logoutPath: '/auth/logout',
} as const;

const EnvRouterConfigSchema = z.object({
	ROUTER_DOMAIN: z.string(),
	ROUTER_COOKIE_KEY: z.string().optional().default(RouterConfigDefaults.cookieKey),
	ROUTER_CALLBACK_PATH: z.string().optional().default(RouterConfigDefaults.callbackPath),
	ROUTER_LOGIN_PATH: z.string().optional().default(RouterConfigDefaults.loginPath),
	ROUTER_LOGOUT_PATH: z.string().optional().default(RouterConfigDefaults.logoutPath),
});

export class RouterConfigFactory {
	static forEnv(env: unknown): RouterConfig {
		const { ROUTER_DOMAIN, ROUTER_COOKIE_KEY, ROUTER_CALLBACK_PATH, ROUTER_LOGIN_PATH, ROUTER_LOGOUT_PATH } =
			EnvRouterConfigSchema.parse(env);

		return new RouterConfig(ROUTER_DOMAIN, ROUTER_COOKIE_KEY, ROUTER_CALLBACK_PATH, ROUTER_LOGIN_PATH, ROUTER_LOGOUT_PATH);
	}
}
