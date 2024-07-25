export interface CookieSecretRepository {
	findById(id: string): Promise<CookieSecretState | null>;
	upsert(id: string, state: CookieSecretState): Promise<void>;
	delete(id: string): Promise<void>;
	expire(): Promise<void>;
}

export interface CookieSecretState {
	value: string;
	createdAt: Date;
	expiresAt: Date;
}
