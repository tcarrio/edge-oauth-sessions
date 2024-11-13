import type { z } from 'zod';

export function assert(condition: boolean, message: string): asserts condition is true {
	if (!condition) {
		throw new Error(message);
	}
}

export function assertZ<T extends z.Schema>(schema: T, value: unknown, message: string): asserts value is z.infer<T> {
	assert(schema.safeParse(value).success, message);
}
