import { assert } from "@eos/domain/invariance";
import { z } from "zod";

const EnvNeonConfigSchema = z.object({
	NEON_DATABASE_URI: z.string().url(),
	NEON_DATABASE_SESSIONS_TABLE: z.string().optional(),
});

export class NeonConfig {
	public static readonly DEFAULT_SESSIONS_TABLE = "auth_sessions";

	constructor(
		public readonly databaseUri: string,
		public readonly sessionsTable: string = NeonConfig.DEFAULT_SESSIONS_TABLE,
	) {
		this.validate();
	}

	static fromEnv(env: z.infer<typeof EnvNeonConfigSchema>) {
		return new NeonConfig(
			env.NEON_DATABASE_URI,
			env.NEON_DATABASE_SESSIONS_TABLE,
		);
	}

	private validate(): asserts this is NeonConfig {
		assert(
			!z.string().url().safeParse(this.databaseUri).error,
			"Database URI must be valid",
		);
		assert(
			!z
				.string()
				.regex(/^[a-zA-Z0-9_]+$/)
				.safeParse(this.databaseUri).error,
			'Auth session table must match the regex "^[a-zA-Z0-9_]+$"',
		);
	}
}
