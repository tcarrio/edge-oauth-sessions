import { assertZ } from '@eos/domain/invariance';
import type { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { WorkOS } from '@workos-inc/node';
import { AuthenticationClient } from 'auth0';
import { z } from 'zod';
import { Auth0OIDCClient, Auth0OIDCOptionsSchema, EnvAuth0OIDCOptionsSchema, mapper as auth0Mapper } from '../auth0/auth0-oidc-client';
import { FetchHttpClientConfig } from '../http/fetch-config';
import { FetchHttpClient } from '../http/fetch-http-client';
import type { HttpClient } from '../http/http-client';
import {
	EnvOryOIDCOptionsSchema,
	OryOIDCClient,
	type OryOIDCOptions,
	OryOIDCOptionsSchema,
	mapper as oryMapper,
} from '../ory/ory-oidc-schema';
import {
	EnvWorkOSOIDCOptionsSchema,
	WorkOSOAuthClient,
	type WorkOSOIDCOptions,
	WorkOSOIDCOptionsSchema,
	mapper as workOSMapper,
} from '../workos/workos-oauth-client';
import {
	EnvGenericOIDCOptionsSchema,
	GenericOIDCClient,
	type GenericOIDCOptions,
	GenericOIDCOptionsSchema,
	mapper as genericMapper,
} from './generic-oidc-client';

export const Strategy = {
	Auth0: 'auth0',
	WorkOS: 'workos',
	Ory: 'ory',
	Generic: 'generic',
} as const;

export class OpenIDConnectClientFactory {
	constructor(private readonly httpClient: HttpClient) {}

	static withFetchClient(): OpenIDConnectClientFactory {
		return new OpenIDConnectClientFactory(new FetchHttpClient(FetchHttpClientConfig.default()));
	}

	forEnv(env: unknown): OpenIDConnectClient {
		assertZ(
			z.object({
				OAUTH_STRATEGY: z.string().optional(),
			}),
			env,
			'Env must be a valid object with an optional OAUTH_STRATEGY key.',
		);

		const strategy = env.OAUTH_STRATEGY;

		switch (strategy) {
			case Strategy.Auth0: {
				const { authorizationUri, ...auth0Options } = auth0Mapper(EnvAuth0OIDCOptionsSchema.parse(env));

				return new Auth0OIDCClient(new AuthenticationClient({ ...auth0Options }), authorizationUri);
			}

			case Strategy.WorkOS: {
				const { apiKey, ...workOSOptions } = workOSMapper(EnvWorkOSOIDCOptionsSchema.parse(env));

				// TODO: Zod schema parity with interface
				return new WorkOSOAuthClient(new WorkOS(apiKey), workOSOptions as WorkOSOIDCOptions);
			}

			case Strategy.Ory: {
				const oryOptions = oryMapper(EnvOryOIDCOptionsSchema.parse(env));

				return new OryOIDCClient(oryOptions, this.httpClient);
			}

			default: {
				const genericOptions = genericMapper(EnvGenericOIDCOptionsSchema.parse(env));

				return new GenericOIDCClient(genericOptions, this.httpClient);
			}
		}
	}

	forStrategy(strategy: string, options: Record<string, unknown>): OpenIDConnectClient {
		switch (strategy) {
			case Strategy.Auth0: {
				const { authorizationUri, ...auth0Options } = Auth0OIDCOptionsSchema.parse(options);

				return new Auth0OIDCClient(new AuthenticationClient({ ...auth0Options }), authorizationUri);
			}
			case Strategy.WorkOS: {
				const workOSOptions = WorkOSOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new WorkOSOAuthClient(new WorkOS(workOSOptions.apiKey), workOSOptions as WorkOSOIDCOptions);
			}
			case Strategy.Ory: {
				const oryOptions = OryOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new OryOIDCClient(oryOptions as OryOIDCOptions, this.httpClient);
			}
			default: {
				const genericOptions = GenericOIDCOptionsSchema.parse(options);

				// TODO: Zod schema parity with interface
				return new GenericOIDCClient(genericOptions as GenericOIDCOptions, this.httpClient);
			}
		}
	}
}