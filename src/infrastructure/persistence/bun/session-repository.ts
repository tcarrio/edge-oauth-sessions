import { Database } from 'bun:sqlite';
import { SqliteStatementTemplates } from '../sqlite/session-statements';
import { SessionRepository } from '@eos/domain/sessions/session-repository';
import { ISessionState } from '@eos/domain/sessions/session-state';

export class SqliteSessionRepository implements SessionRepository {
	private readonly statementTemplates: SqliteStatementTemplates;

	constructor(private readonly db: Database, table: string) {
		this.statementTemplates = new SqliteStatementTemplates(table);
	}

	async findById(id: string): Promise<ISessionState | null> {
		return await this.db.prepare<ISessionState, [string]>(this.statementTemplates.findById).get(id);
	}

	async upsert(id: string, { accessToken, refreshToken, idToken }: ISessionState): Promise<void> {
		await this.db.prepare<ISessionState, [string, string, string, string|null]>(this.statementTemplates.upsert).run(id, accessToken, refreshToken, idToken ?? null);
	}

	async delete(id: string): Promise<void> {
		await this.db.prepare<never, [string]>(this.statementTemplates.delete).run(id);
	}

	async prepare(): Promise<void> {
		await this.db.run(this.statementTemplates.ensureTables);
	}
}
