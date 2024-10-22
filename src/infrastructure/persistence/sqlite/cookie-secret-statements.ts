const Columns = {
	Id: 'id',
	Secret: 'secret',
	CreatedAt: 'created_at',
	ExpiresAt: 'expires_at',
} as const;
const C = Columns;

export class SqliteStatementTemplates {
	constructor(private readonly table: string) {}
	get ensureTables() {
		return `CREATE TABLE IF NOT EXISTS ${this.table} (
			${C.Id} TEXT PRIMARY KEY NOT NULL,
			${C.Secret} TEXT NOT NULL,
			${C.CreatedAt} NUMBER NOT NULL,
			${C.ExpiresAt} NUMBER NOT NULL
		)`;
	}

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
