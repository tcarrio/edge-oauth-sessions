import { CookieSecretRepository, CookieSecretState } from '@eos/domain/sessions/cookie-secret-repository';
import { SqliteStatementTemplates } from '../sqlite/cookie-secret-statements';

export class D1CookieSecretRepository implements CookieSecretRepository {
	private readonly statementTemplates: SqliteStatementTemplates;

	constructor(private readonly db: D1Database, table: string) {
		this.statementTemplates = new SqliteStatementTemplates(table);
	}

	async findById(id: string): Promise<CookieSecretState | null> {
		const statement = this.db.prepare(this.statementTemplates.findById).bind(id);

		return await statement.first();
	}

	async upsert(id: string, {value, createdAt,expiresAt}: CookieSecretState): Promise<void> {
		const statement = this.db.prepare(this.statementTemplates.upsert).bind(id, value, createdAt, expiresAt);

		await statement.run();
	}

	async delete(id: string): Promise<void> {
		const statement = this.db.prepare(this.statementTemplates.delete).bind(id);

		await statement.run();
	}

	async expire(time = Date.now()): Promise<void> {
		const statement = this.db.prepare(this.statementTemplates.expire).bind(time);

		await statement.run();
	}
}
