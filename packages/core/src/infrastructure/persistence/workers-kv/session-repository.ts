import { SessionRepository } from '@eos/domain/sessions/session-repository';
import { ISessionState } from '@eos/domain/sessions/session-state';
import { z } from 'zod';
import { KVConfig } from './config';
import { KVService } from './service';

const KVStateSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
	idToken: z.string().optional(),
});

export class KVSessionRepository implements SessionRepository {
	constructor(private readonly service: KVService, private readonly config: KVConfig) {}

	async findById(id: string): Promise<ISessionState | null> {
		const json = this.service.getClient().get(this.keyForSessionId(id), { type: 'json' });

		const { success, data } = KVStateSchema.safeParse(json);

		if (!success) {
			console.error('A fatal error occurred in the structure of the database record!');

			return null;
		}

		return data;
	}

	async upsert(id: string, session: ISessionState): Promise<void> {
		this.service.getClient().put(this.keyForSessionId(id), JSON.stringify(session));
	}

	async delete(id: string): Promise<void> {
		this.service.getClient().delete(this.keyForSessionId(id));
	}

	private keyForSessionId(id: string): string {
		return [this.config.keyPrefix, id].filter(Boolean).join('-');
	}
}
