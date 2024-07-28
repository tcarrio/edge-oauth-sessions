import type {
	CookieSecretRepository,
	CookieSecretState,
} from "@eos/domain/sessions/cookie-secret-repository";
import type { Database } from "bun:sqlite";
import { SqliteStatementTemplates } from "../sqlite/cookie-secret-statements";

export class SqliteCookieSecretRepository implements CookieSecretRepository {
	private readonly statementTemplates: SqliteStatementTemplates;

	constructor(
		private readonly db: Database,
		table: string,
	) {
		this.statementTemplates = new SqliteStatementTemplates(table);
	}

	async findById(id: string): Promise<CookieSecretState | null> {
		const statement = this.db.prepare<PrimitiveCookieSecretState, [string]>(
			this.statementTemplates.findById,
		);

		const result = await statement.get(id);

		return result ? CookieSecretStateSerde.deserialize(result) : null;
	}

	async upsert(id: string, state: CookieSecretState): Promise<void> {
		const statement = this.db.prepare<
			PrimitiveCookieSecretState,
			[string, string, number, number]
		>(this.statementTemplates.upsert);

		const { value, createdAt, expiresAt } =
			CookieSecretStateSerde.serialize(state);

		await statement.run(id, value, createdAt, expiresAt);
	}

	async delete(id: string): Promise<void> {
		const statement = this.db.prepare<never, [string]>(
			this.statementTemplates.delete,
		);

		await statement.run(id);
	}

	async expire(time = Date.now()): Promise<void> {
		const statement = this.db.prepare<never, [number]>(
			this.statementTemplates.expire,
		);

		await statement.run(time);
	}

	async prepare(): Promise<void> {
		await this.db.run(this.statementTemplates.ensureTables);
	}
}

type PrimitiveCookieSecretState = {
	[key in keyof CookieSecretState]: CookieSecretState[key] extends Date
		? number
		: CookieSecretState[key];
};

class CookieSecretStateSerde {
	static serialize(state: CookieSecretState): PrimitiveCookieSecretState {
		return {
			value: state.value,
			createdAt: state.createdAt.getTime(),
			expiresAt: state.expiresAt.getTime(),
		};
	}

	static deserialize(record: PrimitiveCookieSecretState): CookieSecretState {
		return {
			value: record.value,
			createdAt: new Date(record.createdAt),
			expiresAt: new Date(record.expiresAt),
		};
	}
}
