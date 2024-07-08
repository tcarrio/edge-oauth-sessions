import { UserAuthenticationState } from "./types";

export interface OAuthClient {
	getAuthorizationUrl(options: AuthorizationOptions): string;
	exchangeCode(options: ExchangeOptions): Promise<UserAuthenticationState>;
	refresh(options: RefreshOptions): Promise<UserAuthenticationState>;
}

export interface AuthorizationOptions extends Record<string, any> {
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

export interface ExchangeOptions extends Partial<Record<string, string>> {
	code: string;
	clientId?: string;
}

export interface RefreshOptions extends Partial<Record<string, string>> {
	refreshToken: string;
	clientId?: string;
}
