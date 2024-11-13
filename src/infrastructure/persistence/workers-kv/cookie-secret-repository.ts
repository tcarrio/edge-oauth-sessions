import type { CookieSecretRepository, CookieSecretState } from '@eos/domain/sessions/cookie-secret-repository';
import { z } from 'zod';
import type { KVConfig } from './config';
import type { KVService } from './service';

const KVStateSchema = z.object({
	value: z.string(),
	createdAt: z.date(),
	expiresAt: z.date(),
});

export class KVCookieSecretRepository implements CookieSecretRepository {
	constructor(
		private readonly service: KVService,
		private readonly config: KVConfig,
	) {}

	prepare(): Promise<void> {
		return Promise.resolve();
	}

	async findById(id: string): Promise<CookieSecretState | null> {
		const json = this.service.getClient().get(this.keyForSessionId(id), { type: 'json' });

		const { success, data } = KVStateSchema.safeParse(json);

		if (!success) {
			console.error('A fatal error occurred in the structure of the database record!');

			return null;
		}

		return data;
	}

	async upsert(id: string, state: CookieSecretState): Promise<void> {
		this.service.getClient().put(this.keyForSessionId(id), JSON.stringify(state), {
			expiration: state.expiresAt.getTime(),
		});
	}

	async delete(id: string): Promise<void> {
		this.service.getClient().delete(this.keyForSessionId(id));
	}

	async expire(): Promise<void> {
		// no-op, keys are auto-expiring
	}

	private keyForSessionId(id: string): string {
		return [this.config.keyPrefix, id].filter(Boolean).join('-');
	}
}
