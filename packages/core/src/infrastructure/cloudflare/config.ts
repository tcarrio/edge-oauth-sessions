import { z } from 'zod';
import { Env } from './@types/env';

export class CloudflareConfig {
	constructor(
		public readonly geolocationEnabled: boolean,
		public readonly botScoringEnabled: boolean,
	) {}
}

const EnvRouterConfigSchema = z.object({
	CLOUDFLARE_GEOLOCATION_ENABLED: z.boolean().default(true),
	CLOUDFLARE_BOT_SCORING_ENABLED: z.boolean().default(true),
});

export class CloudflareConfigFactory {
	static forEnv(env: Env): CloudflareConfig {
		const { CLOUDFLARE_GEOLOCATION_ENABLED, CLOUDFLARE_BOT_SCORING_ENABLED } = EnvRouterConfigSchema.parse(env);

		return new CloudflareConfig(CLOUDFLARE_GEOLOCATION_ENABLED, CLOUDFLARE_BOT_SCORING_ENABLED);
	}
}


