import type {
	CookieSecretRepository,
	CookieSecretState,
} from "@eos/domain/sessions/cookie-secret-repository";
import { PostgresStatementTemplates } from "../postgres/cookie-secret-statements";

export class NeonCookieSecretRepository implements CookieSecretRepository {
	private readonly statementTemplates: PostgresStatementTemplates;

	constructor(
		private readonly db: D1Database,
		table: string,
	) {
		this.statementTemplates = new PostgresStatementTemplates(table);
	}

	async findById(id: string): Promise<CookieSecretState | null> {
		return await this.db
			.prepare(this.statementTemplates.findById)
			.bind(id)
			.first();
	}

	async upsert(
		id: string,
		{ value, createdAt, expiresAt }: CookieSecretState,
	): Promise<void> {
		await this.db
			.prepare(this.statementTemplates.upsert)
			.bind(id, value, createdAt, expiresAt)
			.run();
	}

	async delete(id: string): Promise<void> {
		await this.db.prepare(this.statementTemplates.delete).bind(id).run();
	}

	async expire(time = Date.now()): Promise<void> {
		await this.db.prepare(this.statementTemplates.expire).bind(time).run();
	}

	async prepare(): Promise<void> {
		await this.db.prepare(this.statementTemplates.ensureTables).run();
	}
}
