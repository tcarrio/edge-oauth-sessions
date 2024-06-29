import { Repository } from "../@types/repository";

export class CachedRepository<T> implements Repository<T> {
	private value: T|null = null;
	private valueUpdateTime: Date = new Date(0);

	constructor(private readonly repository: Repository<T>, private readonly ttlMs: number) {}

	async get(): Promise<T> {
		const now = new Date();
		const msSinceUpdate = now.getTime() - this.valueUpdateTime.getTime();
		if (!this.value || msSinceUpdate > this.ttlMs) {
			this.value = await this.repository.get();
			this.valueUpdateTime = now;
		}

		return this.value;
	}
}
