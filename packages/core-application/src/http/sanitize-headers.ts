export function sanitizeHeader(value: string | number): string {
	switch (typeof value) {
		case 'string':
			return value.normalize('NFD').replace(/[^\p{ASCII}]/gu, '');

		default:
			return String(value);
	}
}
