import { CookieSecretRepository, CookieSecretState } from '@eos/domain/sessions/cookie-secret-repository';

export class D1CookieSecretRepository implements CookieSecretRepository {
	private readonly statementTemplates: StatementTemplates;

	constructor(private readonly db: D1Database, table: string) {
		this.statementTemplates = new StatementTemplates(table);
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

const Columns = {
	Id: 'id',
	Secret: 'secret',
	CreatedAt: 'created_at',
	ExpiresAt: 'expires_at',
} as const;
const C = Columns;

export class StatementTemplates {
	constructor(private readonly table: string) {}
	get findById() {
		return `SELECT * FROM ${this.table} WHERE id = ?1`;
	}
	get upsert() {
		return `INSERT INTO ${this.table}(${C.Id},${C.Secret},${C.CreatedAt},${C.ExpiresAt}) VALUES(?1, ?2, ?3, ?4)
  		ON CONFLICT(${C.Id}) DO UPDATE SET ${C.Id}=?1,${C.Secret}=?2,${C.CreatedAt}=?3,${C.ExpiresAt}=?4;`;
	}
	get delete() {
		return `DELETE FROM ${this.table} WHERE id = ?1`;
	}
	get expire() {
		return `DELETE FROM ${this.table} WHERE expires_at < ?1`;
	}
}
