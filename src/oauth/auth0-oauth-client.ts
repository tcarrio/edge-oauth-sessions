import { AuthenticationClient } from 'auth0';
import { AuthorizationOptions, ExchangeOptions, OAuthClient, RefreshOptions, ScreenHintType, UserAuthenticationState } from './client';

export class Auth0OAuthClient implements OAuthClient {
	private static readonly OIDC_SCOPES = 'openid profile email';

	constructor(private readonly auth0: AuthenticationClient, private readonly baseAuthorizationUrl: string) {}

	async exchangeCode({ clientId, code, ...options }: ExchangeOptions): Promise<UserAuthenticationState> {
		const { data } = await this.auth0.oauth.authorizationCodeGrant({ client_id: clientId, code, ...options });

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			refreshToken: data.refresh_token,
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

	async refresh({clientId, refreshToken, ...options }: RefreshOptions): Promise<UserAuthenticationState> {
		const { data } = await this.auth0.oauth.refreshTokenGrant({ ...options, refresh_token: refreshToken, client_id: clientId })

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			refreshToken: data.refresh_token,
		}
	}

	private coerceScreenHintOption(screenHint?: ScreenHintType): Partial<Record<'screen_hint', string>> {
		return screenHint ? ({ screen_hint: screenHint === 'SignIn' ? 'login' : 'signup' }) : {};
	}
}
