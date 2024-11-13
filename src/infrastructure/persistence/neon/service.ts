import { Client } from '@neondatabase/serverless';
import type { NeonConfig } from './config';

export class NeonService {
	private client: Client | null = null;

	constructor(private readonly config: NeonConfig) {}

	getClient(): Client {
		return (this.client ??= new Client(this.config.databaseUri));
	}
}
