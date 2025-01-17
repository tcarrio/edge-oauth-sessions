import { Redis } from "@upstash/redis/cloudflare";
import { UpstashRedisConfig } from "./config";

export class UpstashRedisClientFactory {
	static forConfig(config: UpstashRedisConfig): Redis {
		return new Redis(config);
	}
}


