import { z } from 'zod';

export class UpstashRedisConfig {
	private static readonly schema = z.object({
		token: z.string().min(1),
		url: z.string().url(),
	});

	constructor(
		public readonly token: string,
		public readonly url: string,
	) {}

	from(object: object): UpstashRedisConfig {
		const { token, url } = UpstashRedisConfig.schema.parse(object);

		return new UpstashRedisConfig(token, url);
	}
}
