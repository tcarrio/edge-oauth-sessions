import { z } from 'zod';
import { Env } from '../../@types/env';
import { assert } from '../../util/assert';

export class NeonConfig {
	public static readonly DEFAULT_SESSIONS_TABLE = 'auth_sessions';

	constructor(public readonly databaseUri: string, public readonly sessionsTable: string = NeonConfig.DEFAULT_SESSIONS_TABLE) {
		this.validate();
	}

	static fromEnv(env: Env) {
		return new NeonConfig(env.NEON_DATABASE_URI, env.NEON_DATABASE_SESSIONS_TABLE);
	}

	private validate(): asserts this is NeonConfig {
		assert(!z.string().url().safeParse(this.databaseUri).error, 'Database URI must be valid');
		assert(!z.string().regex(/^[a-zA-Z0-9_]+$/).safeParse(this.databaseUri).error, 'Auth session table must match the regex "^[a-zA-Z0-9_]+$"');
	}
}
