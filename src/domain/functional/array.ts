export function any<T>(array: Iterable<T>, predicate: (item: T) => boolean): boolean {
	for (const item of array) {
		if (predicate(item) === true) {
			return true;
		}
	}

	return false;
}

export function merge<T extends Array<unknown>>(...arrays: Array<T>): T {
	return arrays.reduce(
		(merged, currentArray) => {
			merged.push(...currentArray);
			return merged;
		},
		[] as unknown as T,
	);
}
