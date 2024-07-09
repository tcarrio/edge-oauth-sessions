export interface BaseOAuthOptions extends Record<string, unknown> {
	clientId: string;
	redirectUri: string;
}
