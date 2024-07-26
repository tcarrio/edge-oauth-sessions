export class KVService {
	constructor(private readonly namespace: KVNamespace) {}

	getClient(): KVNamespace {
		return this.namespace;
	}
}

