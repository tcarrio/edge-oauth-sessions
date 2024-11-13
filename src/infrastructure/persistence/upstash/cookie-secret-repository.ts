import type { CookieSecretRepository, CookieSecretState } from '@eos/domain/sessions/cookie-secret-repository';
import type { Redis } from '@upstash/redis/cloudflare';

export class D1CookieSecretRepository implements CookieSecretRepository {
	constructor(
		private readonly redis: Redis,
		private readonly namespace: string,
	) {}

	async findById(id: string): Promise<CookieSecretState | null> {
		return await this.redis.get<CookieSecretState>(this.namespaced(id));
	}

	async upsert(id: string, state: CookieSecretState): Promise<void> {
		await this.redis.set(this.namespaced(id), state, {
			exat: state.expiresAt.getTime(),
		});
	}

	async delete(id: string): Promise<void> {
		await this.redis.del(this.namespaced(id));
	}

	async expire(): Promise<void> {
		// no-op, records are self-expiring
	}

	private namespaced(key: string): string {
		return `${this.namespace}:${key}`;
	}
}
