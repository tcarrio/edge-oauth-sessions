export interface BaseOAuthOptions extends Record<string, unknown> {
	clientId: string;
	redirectUri: string;
}

export interface UserAuthenticationState {
	accessToken: string;
	refreshToken: string;
	idToken?: string;
}
