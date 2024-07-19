import { AuthenticationClient } from 'auth0';
import { Auth0OIDCClient, Auth0OIDCOptions, Auth0OIDCOptionsSchema } from '../auth0/auth0-oidc-client';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { WorkOSOAuthClient, WorkOSOIDCOptions, WorkOSOIDCOptionsSchema } from '../workos/workos-oauth-client';
import { WorkOS } from '@workos-inc/node';
import { GenericOIDCClient, GenericOIDCOptions, GenericOIDCOptionsSchema } from './generic-oidc-client';
import { z } from 'zod';
import { HttpClient } from '../http/http-client';
import { OryOIDCClient, OryOIDCOptions, OryOIDCOptionsSchema } from '../ory/ory-oidc-schema';
import { FetchHttpClient } from '../http/fetch-http-client';
import { FetchHttpClientConfig } from '../http/fetch-config';

const Strategy = {
	Auth0: 'auth0',
	WorkOS: 'workos',
	Ory: 'ory',
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
	constructor(private readonly httpClient: HttpClient) {}

	static withFetchClient(): OpenIDConnectClientFactory {
		return new OpenIDConnectClientFactory(new FetchHttpClient(FetchHttpClientConfig.default()));
	}

	forEnv(env: z.infer<typeof EnvOpenIDConnectClientFactorySchema>): OpenIDConnectClient {
		return this.forStrategy(env.OAUTH_STRATEGY, {
			clientId: env.OAUTH_CLIENT_ID,
			clientSecret: env.OAUTH_CLIENT_SECRET,
			redirectUri: env.OAUTH_REFRESH_URI,
			retries: env.OAUTH_REFRESH_MAX_RETRIES,
		});
	}

	forStrategy(strategy: any, options: Record<string, any>): OpenIDConnectClient {
		switch (strategy) {
			case Strategy.Auth0:
				const { authorizationUri, ...auth0Options } = Auth0OIDCOptionsSchema.parse(options);

				return new Auth0OIDCClient(new AuthenticationClient({ ...auth0Options }), authorizationUri);

			case Strategy.WorkOS:
				const workOSOptions = WorkOSOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new WorkOSOAuthClient(new WorkOS(workOSOptions.apiKey), workOSOptions as WorkOSOIDCOptions);

			case Strategy.Ory:
				const oryOptions = OryOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new OryOIDCClient(oryOptions as OryOIDCOptions, this.httpClient);

			case Strategy.Generic:
			default:
				const genericOptions = GenericOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new GenericOIDCClient(genericOptions as GenericOIDCOptions, this.httpClient);
		}
	}
}
