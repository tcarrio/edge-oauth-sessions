export function any<T>(array: Array<T>, predicate: (item: T) => boolean): boolean {
	for (const item of array) {
		if (predicate(item) === true) {
			return true;
		}
	}

	return false;
}
