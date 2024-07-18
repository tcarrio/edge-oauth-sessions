import { AuthorizationUrlOptions, ExchangeCodeOptions, OIDCScopeType, OpenIDConnectClient, RefreshOptions, ScreenHintType } from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import { BaseOAuthOptions } from '@eos/domain/open-id-connect/types';
import { SessionState } from '@eos/domain/sessions/session-state';
import { AuthenticationClient } from 'auth0';

export class Auth0OAuthClient implements OpenIDConnectClient {
	private static readonly DEFAULT_SCOPES: OIDCScopeType[] = ['openid', 'profile', 'email'];

	constructor(private readonly auth0: AuthenticationClient, private readonly baseAuthorizationUrl: string) {}

	getAuthorizationUrl({ clientId, redirectUri, screenHint, ...options }: AuthorizationUrlOptions): string {
		const url = new URL(this.baseAuthorizationUrl);

		url.search = new URLSearchParams({
			...options,
			...this.coerceScreenHintOption(screenHint),
			scope: (options.scope ?? Auth0OAuthClient.DEFAULT_SCOPES).toString(), // TODO: Dynamic scopes based on the auth strategy
			response_type: 'code',
			client_id: clientId,
			redirect_uri: redirectUri,
		}).toString();

		return url.toString();
	}

	async exchangeCode({ clientId, code, ...options }: ExchangeCodeOptions): Promise<SessionState> {
		const { data } = await this.auth0.oauth.authorizationCodeGrant({ client_id: clientId, code, ...options });

		const { access_token, id_token, refresh_token } = OAuthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}

	async refresh({ client_id, refresh_token, ...options }: RefreshOptions): Promise<SessionState> {
		const { data } = await this.auth0.oauth.refreshTokenGrant({ ...options, refresh_token, client_id });

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			// Auth0 supports refresh token rotation, but if not returned we continue using the old one
			refreshToken: data.refresh_token ?? refresh_token,
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
