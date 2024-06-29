export interface Repository<T> {
	get(): Promise<T>;
}
