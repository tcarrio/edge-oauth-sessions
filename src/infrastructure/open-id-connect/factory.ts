import { AuthenticationClient } from "auth0";
import { Auth0OAuthClient, Auth0OAuthOptions } from "../auth0/auth0-oidc-client";
import { OpenIDConnectClient } from "@eos/domain/open-id-connect/client";
import { WorkOSOAuthClient, WorkOSOAuthOptions } from "../workos/workos-oauth-client";
import { WorkOS } from "@workos-inc/node";
import { GenericOIDCClient, GenericOIDCOptions } from "./generic-oidc-client";
import { z } from "zod";

const Strategy = {
	Auth0: 'auth0',
	WorkOS: 'workos',
	Generic: 'generic',
} as const;

const EnvOpenIDConnectClientFactorySchema = z.object({
	OAUTH_STRATEGY: z.string(),
	OAUTH_CLIENT_ID: z.string(),
	OAUTH_CLIENT_SECRET: z.string(),
	OAUTH_REFRESH_URI: z.string().url(),
	OAUTH_REFRESH_MAX_RETRIES: z.number(),
});

export class OpenIDConnectClientFactory {
	static forEnv(env: z.infer<typeof EnvOpenIDConnectClientFactorySchema>): OpenIDConnectClient {
		return OpenIDConnectClientFactory.forStrategy(env.OAUTH_STRATEGY, {
			clientId: env.OAUTH_CLIENT_ID,
			clientSecret: env.OAUTH_CLIENT_SECRET,
			redirectUri: env.OAUTH_REFRESH_URI,
			retries: env.OAUTH_REFRESH_MAX_RETRIES
		});
	}

	static forStrategy(strategy: any, options: Record<string, any>): OpenIDConnectClient {
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
