import type { ExchangeCodeOptions, OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import type { ISessionState } from '@eos/domain/sessions/session-state';
import { Configuration, OAuth2Api } from '@ory/client-fetch';
import { z } from 'zod';
import { mapperForMapping } from '../common/env-options-mapper';
import type { HttpClient } from '../http/http-client';
import {
	EnvGenericOIDCOptionsSchema,
	GenericOIDCClient,
	type GenericOIDCOptions,
	GenericOIDCOptionsSchema,
} from '../open-id-connect/generic-oidc-client';

export class OryOIDCClient extends GenericOIDCClient implements OpenIDConnectClient {
	private readonly oAuth2Api: OAuth2Api;

	constructor(options: OryOIDCOptions, httpClient: HttpClient) {
		super(options, httpClient);

		this.oAuth2Api = new OAuth2Api(
			new Configuration({
				basePath: options.baseURL,
			}),
		);
	}

	/**
	 * Utilizes the Ory SDK to accomplish the code exchange since this is supported by the SDK.
	 */
	async exchangeCode({
		clientId = this.options.clientId,
		code,
		redirect_uri = this.options.authorization.redirect_uri,
	}: ExchangeCodeOptions): Promise<ISessionState> {
		const exchangeParams = {
			grantType: 'authorization_code',
			code,
			clientId,
			clientSecret: this.options.clientSecret,
			redirectUri: redirect_uri,
		};

		const data = await this.oAuth2Api.oauth2TokenExchange(exchangeParams);

		const { access_token, id_token, refresh_token } = OAuthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}
}

export const OryOIDCOptionsSchema = GenericOIDCOptionsSchema.extend({
	apiKey: z.string().min(1),
});

export const EnvOryOIDCOptionsSchema = EnvGenericOIDCOptionsSchema.extend({
	ORY_API_KEY: z.string().min(1),
});

export const mapper = mapperForMapping<OryOIDCOptions, typeof EnvOryOIDCOptionsSchema>({
	ORY_API_KEY: 'apiKey',
	OAUTH_AUTHORIZATION: 'authorization',
	OAUTH_BASE_URL: 'baseURL',
	OAUTH_ISSUER_URL: 'issuerUrl',
	OAUTH_ISSUER_BASE_URL: 'issuerBaseURL',
	OAUTH_CLIENT_ID: 'clientId',
	OAUTH_CLIENT_SECRET: 'clientSecret',
	OAUTH_SECRET: 'secret',
});

export interface OryOIDCOptions extends GenericOIDCOptions {
	apiKey: string;
}
