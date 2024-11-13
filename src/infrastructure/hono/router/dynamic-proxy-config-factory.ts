import type { DynamicProxyConfig } from '@eos/application/hono/handlers/dynamic-proxy.handler';
import { z } from 'zod';

const EnvDynamicProxyConfigSchema = z.object({
	PROXY_RULES_PROTOCOL: z.enum(['https', 'http']).optional(),
	PROXY_RULES_HOSTNAME: z.string().optional(),
	PROXY_RULES_PORT: z
		.string()
		.regex(/^[1-9][0-9]*$/)
		.optional(),
});

export class DynamicProxyConfigFactory {
	static forEnv(env: unknown): DynamicProxyConfig {
		const {
			PROXY_RULES_PROTOCOL: protocol,
			PROXY_RULES_HOSTNAME: hostname,
			PROXY_RULES_PORT: port,
		} = EnvDynamicProxyConfigSchema.parse(env);

		return {
			protocol,
			hostname,
			port,
		};
	}
}
