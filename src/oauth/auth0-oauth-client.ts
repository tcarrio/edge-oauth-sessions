import { AuthenticationClient } from 'auth0';
import { AuthorizationOptions, ExchangeOptions, OAuthClient, RefreshOptions, UserAuthenticationState } from './client';

export class Auth0OAuthClient extends OAuthClient {
	constructor(private readonly auth0: AuthenticationClient) {
		super();
	}

	async exchangeCode({ clientId, code, ...options }: ExchangeOptions): Promise<UserAuthenticationState> {
		const { data } = await this.auth0.oauth.authorizationCodeGrant({ client_id: clientId, code, ...options });

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			refreshToken: data.refresh_token,
		};
	}

	getAuthorizationUrl({ screenHint, ...options }: AuthorizationOptions): string {

	}

	async refresh(options: RefreshOptions): Promise<UserAuthenticationState> {
	}
}
