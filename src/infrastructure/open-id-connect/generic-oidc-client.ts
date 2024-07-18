import * as z from 'zod';
import {
	AuthorizationUrlOptions,
	ExchangeCodeOptions,
	OIDCScopeType,
	OpenIDConnectClient,
	RefreshOptions,
} from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import { BaseOAuthOptions } from '@eos/domain/open-id-connect/types';
import { SessionState } from '@eos/domain/sessions/session-state';
import { HttpClient, HttpOptions, ResponseFormat } from '../http/http-client';

const RefreshResponseBodySchema = z.object({
	access_token: z.string(),
	id_token: z.string(),
	refresh_token: z.string().optional(),
});

export class GenericOIDCClient implements OpenIDConnectClient {
	protected static readonly OIDC_SCOPES: OIDCScopeType[] = ['openid', 'profile', 'email'];

	public constructor(protected readonly options: GenericOIDCOptions, protected readonly httpClient: HttpClient) {}

	getAuthorizationUrl({ clientId, redirectUri, screenHint, ...options }: AuthorizationUrlOptions): string {
		const url = new URL(`${this.options.issuerUrl}/authorization`);

		url.search = new URLSearchParams({
			...options,
			scope: (options.scope ?? GenericOIDCClient.OIDC_SCOPES).toString(),
			response_type: 'code',
			client_id: clientId ?? this.options.clientId,
			redirect_uri: redirectUri ?? this.options.clientId,
		}).toString();

		return url.toString();
	}

	async exchangeCode({
		code,
		clientId = this.options.clientId,
		clientSecret = this.options.clientSecret,
		redirectUri = this.options.authorization.redirect_uri,
		...options
	}: ExchangeCodeOptions): Promise<SessionState> {
		const requestOptions = {
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

		const res = await this.httpClient.post(`${this.options.issuerUrl}/token`, requestOptions);
		if (!res.ok) {
			throw new Error(`Failed to refresh token: ${res.status}`);
		}

		const json = await res.data();

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

	async refresh({ refresh_token, client_id, ...options }: RefreshOptions): Promise<SessionState> {
		const requestOptions: HttpOptions = {
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			responseType: ResponseFormat.JSON,
		};

		const body = new URLSearchParams({
			...options,
			grant_type: 'refresh_token',
			client_id: client_id ?? this.options.clientId,
			client_secret: this.options.clientSecret,
			refresh_token,
		});

		const res = await this.httpClient.post(`${this.options.issuerUrl}/refresh`, body, requestOptions);

		if (!res.ok) {
			throw new Error(`Failed to refresh token: ${res.status}`);
		}

		const json = await res.data();

		const { success, data } = RefreshResponseBodySchema.safeParse(json);
		if (!success) {
			throw new Error('Invalid response object');
		}

		const { id_token, access_token, refresh_token: newRefreshToken } = data;

		return { idToken: id_token, accessToken: access_token, refreshToken: newRefreshToken ?? refresh_token };
	}
}

export interface GenericOIDCOptions extends BaseOAuthOptions {
	clientSecret: string;
	issuerUrl: string;

	baseURL: string;
	issuerBaseURL: string;
	secret: Buffer;

	authorization: Partial<Omit<AuthorizationUrlOptions, 'client_id' | 'redirect_uri'>> &
		Required<Pick<AuthorizationUrlOptions, 'client_id' | 'redirect_uri'>>;
}
