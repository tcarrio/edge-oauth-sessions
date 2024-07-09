import { AuthorizationOptions, ExchangeOptions, OpenIDConnectClient, RefreshOptions, ScreenHintType } from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import { BaseOAuthOptions } from '@eos/domain/open-id-connect/types';
import { SessionState } from '@eos/domain/sessions/session-state';
import { AuthenticationClient } from 'auth0';

export class Auth0OAuthClient implements OpenIDConnectClient {
	private static readonly OIDC_SCOPES = 'openid profile email';

	constructor(private readonly auth0: AuthenticationClient, private readonly baseAuthorizationUrl: string) {}

	async exchangeCode({ clientId, code, ...options }: ExchangeOptions): Promise<SessionState> {
		const { data } = await this.auth0.oauth.authorizationCodeGrant({ client_id: clientId, code, ...options });

		const { access_token, id_token, refresh_token } = OAuthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}

	getAuthorizationUrl({ clientId, redirectUri, screenHint, ...options }: AuthorizationOptions): string {
		const url = new URL(this.baseAuthorizationUrl);

		url.search = new URLSearchParams({
			...options,
			...this.coerceScreenHintOption(screenHint),
			scope: options.scope ?? Auth0OAuthClient.OIDC_SCOPES, // TODO: Dynamic scopes based on the auth strategy
			response_type: 'code',
			client_id: clientId,
			redirect_uri: redirectUri,
		}).toString();

		return url.toString();
	}

	async refresh({ clientId, refreshToken, ...options }: RefreshOptions): Promise<SessionState> {
		const { data } = await this.auth0.oauth.refreshTokenGrant({ ...options, refresh_token: refreshToken, client_id: clientId });

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			// Auth0 supports refresh token rotation, but if not returned we continue using the old one
			refreshToken: data.refresh_token ?? refreshToken,
		};
	}

	private coerceScreenHintOption(screenHint?: ScreenHintType): Partial<Record<'screen_hint', string>> {
		return screenHint ? { screen_hint: screenHint === 'SignIn' ? 'login' : 'signup' } : {};
	}
}

export interface Auth0OAuthOptions extends BaseOAuthOptions {
	clientSecret: string;
	domain: string;
	authorizationUri: string;
	refreshUri: string;
}
