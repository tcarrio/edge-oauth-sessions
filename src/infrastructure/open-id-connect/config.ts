import { OpenIDConnectConfig } from '@eos/domain/open-id-connect/config';
import z from 'zod';

const EnvOpenIDConnectConfigSchema = z.object({
	OAUTH_REDIRECT_URI: z.string(),
	OAUTH_CLIENT_ID: z.string(),
	OAUTH_CLIENT_SECRET: z.string(),
});

export class OpenIDConnectConfigFactory {
	static forEnv(env: z.infer<typeof EnvOpenIDConnectConfigSchema>): OpenIDConnectConfig {
		const { OAUTH_REDIRECT_URI, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET } = EnvOpenIDConnectConfigSchema.parse(env);

		return {
			redirectUri: OAUTH_REDIRECT_URI,
			clientId: OAUTH_CLIENT_ID,
			clientSecret: OAUTH_CLIENT_SECRET,
		};
	}
}
