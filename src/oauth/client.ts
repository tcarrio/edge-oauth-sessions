export interface OAuthClient {
	getAuthorizationUrl(options: AuthorizationOptions): string;
	exchangeCode(options: ExchangeOptions): Promise<UserAuthenticationState>;
	refresh(options: RefreshOptions): Promise<UserAuthenticationState>;
}

export interface AuthorizationOptions {
	clientId: string;
	redirectUri: string;

	connection?: string;
	state?: string;
	responseType?: string;
	scope?: string;

    codeChallenge?: string;
    codeChallengeMethod?: 'S256';
    organizationId?: string;
    domainHint?: string;
    loginHint?: string;
    provider?: string;
    screenHint?: ScreenHintType;
}

export const ScreenHint = {
	SignUp: 'SignUp',
	SignIn: 'SignIn',
} as const;

export type ScreenHintType = typeof ScreenHint[keyof typeof ScreenHint];

export interface UserAuthenticationState {
	accessToken: string;
	idToken?: string;
	refreshToken?: string;
}

export interface ExchangeOptions extends Record<string, string> {
	clientId: string;
	code: string;
}

export interface RefreshOptions extends Record<string, string> {
	refreshToken: string;
	clientId: string;
}
