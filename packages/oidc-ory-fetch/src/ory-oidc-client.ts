import { OryOIDCOptionsSchema,
EnvOryOIDCOptionsSchema,
mapper,
OryOIDCOptions} from "@eos/oidc-ory-common";
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

	static forEnv(env: unknown = null, httpClient = FetchHttpClient.default()): OryOIDCClient {
		const options = mapper(EnvOryOIDCOptionsSchema.parse(env));

		return new OryOIDCClient(options, httpClient);
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
