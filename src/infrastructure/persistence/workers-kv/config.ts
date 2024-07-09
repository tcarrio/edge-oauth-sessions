import { z } from "zod";
import { Env } from "@eos/infrastructure/cloudflare/@types/env";
import { assert } from "@eos/domain/invariance";

export class KVConfig {
	constructor(public readonly keyPrefix: string) {
		this.validate();
	}

	static fromEnv(env: Env) {
		return new KVConfig(env.KV_KEY_PREFIX);
	}

	private validate(): asserts this is KVConfig {
		assert(!z.string().regex(/^[a-zA-Z0-9_]+$/).safeParse(this.keyPrefix).error, 'KV key prefix must match the regex "^[a-zA-Z0-9_]+$"');
	}
}
