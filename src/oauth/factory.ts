import { AuthenticationClient } from "auth0";
import { Auth0OAuthClient, Auth0OAuthOptions } from "./auth0-oauth-client";
import { OAuthClient } from "./client";
import { WorkOSOAuthClient, WorkOSOAuthOptions } from "./workos-oauth-client";
import { WorkOS } from "@workos-inc/node";
import { GenericOIDCClient, GenericOIDCOptions } from "./generic-oidc-client";
import { Env } from "../@types/env";

const Strategy = {
	Auth0: 'auth0',
	WorkOS: 'workos',
	Generic: 'generic',
} as const;

export class OAuthClientFactory {
	static forEnv(env: Env): OAuthClient {
		return OAuthClientFactory.forStrategy(env.OAUTH_STRATEGY, {
			clientId: env.OAUTH_CLIENT_ID,
			clientSecret: env.OAUTH_CLIENT_SECRET,
			redirectUri: env.OAUTH_REFRESH_URI,
			retries: env.OAUTH_REFRESH_MAX_RETRIES
		});
	}

	static forStrategy(strategy: any, options: Record<string, any>): OAuthClient {
		switch (strategy) {
			case Strategy.Auth0:
				const { authorizationUri, ...auth0Options } = (options as Auth0OAuthOptions);

				return new Auth0OAuthClient(new AuthenticationClient({ ...auth0Options }), authorizationUri);

			case Strategy.WorkOS:
				return new WorkOSOAuthClient(new WorkOS(options.apiKey), options as WorkOSOAuthOptions)


			case Strategy.Generic:
			default:
				return new GenericOIDCClient(options as GenericOIDCOptions);
		}
	}
}
