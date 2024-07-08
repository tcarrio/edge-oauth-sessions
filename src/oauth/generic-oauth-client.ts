import * as z from 'zod';
import { AuthorizationOptions, ExchangeOptions, RefreshOptions, UserAuthenticationState } from './client';
import { BaseOAuthOptions } from './types';
import { OauthCodeExchangeResponseSchema } from './code-exchange';

const RefreshResponseBodySchema = z.object({
	access_token: z.string(),
	id_token: z.string(),
	refresh_token: z.string().optional(),
});

export class GenericOAuthClient {
	private static readonly OIDC_SCOPES = 'openid profile email';

	public constructor(private readonly options: GenericOAuthOptions) {}

	getAuthorizationUrl({ clientId, redirectUri, screenHint, ...options }: AuthorizationOptions): string {
		const url = new URL(`${this.options.baseOIDCUri}/authorization`);

		url.search = new URLSearchParams({
			...options,
			scope: options.scope ?? GenericOAuthClient.OIDC_SCOPES, // TODO: Dynamic scopes based on the auth strategy
			response_type: 'code',
			client_id: clientId,
			redirect_uri: redirectUri,
		}).toString();

		return url.toString();
	}

	async exchangeCode({
		code,
		clientId = this.options.clientId,
		clientSecret = this.options.clientSecret,
		redirectUri = this.options.redirectUri,
		...options
	}: ExchangeOptions): Promise<UserAuthenticationState> {
		const requestOptions = {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				...options,
				grant_type: 'authorization_code',
				code,
				redirect_uri: redirectUri,
				client_id: clientId,
				client_secret: clientSecret,
			}),
		};

		const res = await fetch(`${this.options.baseOIDCUri}/token`, requestOptions);
		if (!res.ok) {
			throw new Error(`Failed to refresh token: ${res.status} ${res.statusText}`);
		}

		const json = await res.json();

		const { success, data } = RefreshResponseBodySchema.safeParse(json);
		if (!success) {
			throw new Error('Invalid response object');
		}

		const { id_token, access_token, refresh_token } = OauthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}

	async refresh({ refreshToken, clientId, ...options }: RefreshOptions): Promise<UserAuthenticationState> {
		const requestOptions = {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				...options,
				grant_type: 'refresh_token',
				client_id: clientId ?? this.options.clientId,
				client_secret: this.options.clientSecret,
				refresh_token: refreshToken,
			}),
		};

		const res = await fetch(`${this.options.baseOIDCUri}/refresh`, requestOptions);

		if (!res.ok) {
			throw new Error(`Failed to refresh token: ${res.status} ${res.statusText}`);
		}

		const json = await res.json();

		const { success, data } = RefreshResponseBodySchema.safeParse(json);
		if (!success) {
			throw new Error('Invalid response object');
		}

		const { id_token, access_token, refresh_token } = data;

		return { idToken: id_token, accessToken: access_token, refreshToken: refresh_token ?? refreshToken };
	}
}

export interface GenericOAuthOptions extends BaseOAuthOptions {
	clientSecret: string;
	baseOIDCUri: string;
}
