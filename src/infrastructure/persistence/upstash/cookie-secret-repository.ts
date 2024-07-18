import { CookieSecretRepository, CookieSecretState } from '@eos/domain/sessions/cookie-secret-repository';
import { Redis } from '@upstash/redis/cloudflare';

export class D1CookieSecretRepository implements CookieSecretRepository {
	constructor(private readonly redis: Redis, private readonly namespace: string) {}

	async findById(id: string): Promise<CookieSecretState | null> {
		const data = await this.redis.get(this.namespaced(id));

		// TODO: Robustnessness
		if (!data || typeof data !== 'string') {
			return null;
		}

		return JSON.parse(data);
	}

	async upsert(id: string, state: CookieSecretState): Promise<void> {
		await this.redis.set(this.namespaced(id), JSON.stringify(state), {
			exat: state.expiresAt.getTime(),
		});
	}

	async delete(id: string): Promise<void> {
		await this.redis.del(this.namespaced(id));
	}

	async expire(): Promise<void> {
		// no-op, records are self-expriing
	}

	private namespaced(key: string): string {
		return `${this.namespace}:${key}`;
	}
}
