const Columns = {
	Id: "session_id",
	AccessToken: "access_token",
	RefreshToken: "refresh_token",
	IdToken: "id_token",
} as const;
const C = Columns;

export class SqliteStatementTemplates {
	constructor(private readonly table: string) {}
	get ensureTables() {
		return `CREATE TABLE IF NOT EXISTS ${this.table} (
			${C.Id} TEXT PRIMARY KEY NOT NULL,
			${C.AccessToken} TEXT NOT NULL,
			${C.RefreshToken} TEXT NOT NULL,
			${C.IdToken} TEXT
		)`;
	}

	get findById() {
		return `SELECT * FROM ${this.table} WHERE id = ?1`;
	}
	get upsert() {
		return `INSERT INTO ${this.table}(${C.Id},${C.AccessToken},${C.RefreshToken},${C.IdToken}) VALUES(?1, ?2, ?3, ?4)
  		ON CONFLICT(${C.Id}) DO UPDATE SET ${C.Id}=?1,${C.AccessToken}=?2,${C.RefreshToken}=?3,${C.IdToken}=?4;`;
	}
	get delete() {
		return `DELETE FROM ${this.table} WHERE id = ?1`;
	}
}
