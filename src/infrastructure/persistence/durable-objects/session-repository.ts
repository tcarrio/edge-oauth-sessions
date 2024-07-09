import { SessionRepository } from '@eos/domain/sessions/session-repository';
import { SessionState } from '@eos/domain/sessions/session-state';

export class DurableObjectStateSessionRepository implements SessionRepository {
	constructor(private readonly ctx: DurableObjectState) {}

	async findById(id: string): Promise<SessionState | null> {
		return (await this.ctx.storage.get<SessionState>(id)) ?? null;
	}

	async upsert(id: string, session: SessionState): Promise<void> {
		await this.ctx.storage.put(id, session);
	}

	async delete(id: string): Promise<void> {
		this.ctx.storage.delete(id);
	}
}
