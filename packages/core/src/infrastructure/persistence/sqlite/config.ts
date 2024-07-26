import { z } from "zod";

export interface SqliteConfig {
    file: string | ':memory:';
	createIfNotExists: boolean;
}

export const SqliteConfigSchema = z.object({
    file: z.string(),
	createIfNotExists: z.boolean(),
}) satisfies z.ZodType<SqliteConfig>;

export const EnvSqliteConfigSchema = z.object({
    SQLITE_FILE: z.string(),
	SQLITE_CREATE_IF_NOT_EXISTS: z.boolean().default(true),
});

export class SqliteConfigFactory {
	static forEnv(env: z.infer<typeof EnvSqliteConfigSchema>): SqliteConfig {
		const { SQLITE_FILE, SQLITE_CREATE_IF_NOT_EXISTS } = EnvSqliteConfigSchema.parse(env);

		return {
			file: SQLITE_FILE,
			createIfNotExists: SQLITE_CREATE_IF_NOT_EXISTS,
		};
	}
}
