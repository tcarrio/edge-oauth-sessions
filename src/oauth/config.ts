import z from 'zod';
import { Env } from '../@types/env';

const EnvOAuthConfigSchema = z.object({
	REDIRECT_URI: z.string(),
	CLIENT_ID: z.string(),
	CLIENT_SECRET: z.string(),
});

export interface OAuthConfig {
	redirectUri: string;
	clientId: string;
	clientSecret: string;
}

export function getConfigFromEnv(env: Env): OAuthConfig {
	const { REDIRECT_URI, CLIENT_ID, CLIENT_SECRET } = EnvOAuthConfigSchema.parse(env);

	return {
		redirectUri: REDIRECT_URI,
		clientId: CLIENT_ID,
		clientSecret: CLIENT_SECRET,
	};
}
