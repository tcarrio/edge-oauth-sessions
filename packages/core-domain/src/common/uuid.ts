export interface UuidFactory {
	random(): string;
	tryFrom(maybeUuid: string): string;
}
