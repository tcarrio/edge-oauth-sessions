import * as z from 'zod';
import { AuthorizationOptions, ExchangeOptions, RefreshOptions } from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import { BaseOAuthOptions } from '@eos/domain/open-id-connect/types';
import { SessionState } from '@eos/domain/sessions/session-state';

const RefreshResponseBodySchema = z.object({
	access_token: z.string(),
	id_token: z.string(),
	refresh_token: z.string().optional(),
});

export class GenericOIDCClient {
	private static readonly OIDC_SCOPES = 'openid profile email';

	public constructor(private readonly options: GenericOIDCOptions) {}

	getAuthorizationUrl({ clientId, redirectUri, screenHint, ...options }: AuthorizationOptions): string {
		const url = new URL(`${this.options.baseOIDCUri}/authorization`);

		url.search = new URLSearchParams({
			...options,
			scope: options.scope ?? GenericOIDCClient.OIDC_SCOPES, // TODO: Dynamic scopes based on the auth strategy
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
	}: ExchangeOptions): Promise<SessionState> {
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

		const { id_token, access_token, refresh_token } = OAuthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}

	async refresh({ refreshToken, clientId, ...options }: RefreshOptions): Promise<SessionState> {
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

export interface GenericOIDCOptions extends BaseOAuthOptions {
	clientSecret: string;
	baseOIDCUri: string;
}
