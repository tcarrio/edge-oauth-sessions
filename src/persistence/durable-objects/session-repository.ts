import { UserAuthenticationState } from '../../oauth/types';
import { SessionRepository } from '../../sessions/session-repository';

export class DurableObjectStateSessionRepository implements SessionRepository {
	constructor(private readonly ctx: DurableObjectState) {}

	async findById(id: string): Promise<UserAuthenticationState | null> {
		return (await this.ctx.storage.get<UserAuthenticationState>(id)) ?? null;
	}

	async upsert(id: string, session: UserAuthenticationState): Promise<void> {
		await this.ctx.storage.put(id, session);
	}

	async delete(id: string): Promise<void> {
		this.ctx.storage.delete(id);
	}
}
