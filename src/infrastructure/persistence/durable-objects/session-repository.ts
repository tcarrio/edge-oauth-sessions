import type { SessionRepository } from "@eos/domain/sessions/session-repository";
import type { ISessionState } from "@eos/domain/sessions/session-state";

export class DurableObjectStateSessionRepository implements SessionRepository {
	constructor(private readonly ctx: DurableObjectState) {}

	async findById(id: string): Promise<ISessionState | null> {
		return (await this.ctx.storage.get<ISessionState>(id)) ?? null;
	}

	async upsert(id: string, session: ISessionState): Promise<void> {
		await this.ctx.storage.put(id, session);
	}

	async delete(id: string): Promise<void> {
		this.ctx.storage.delete(id);
	}

	async prepare(): Promise<void> {
		// no-op, storage is implicitly ready
	}
}
