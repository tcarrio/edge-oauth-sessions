import { any } from './array';

// biome-ignore lint/suspicious/noExplicitAny: Must allow any for full coverage
type Memoizer<Params extends any[] = any[], Value = any> = InitializedMemoizer<Params, Value> | UninitializedMemoizer;

// biome-ignore lint/suspicious/noExplicitAny: Must allow any for generic function
type InitializedMemoizer<Params extends any[], Value> = {
	previousArgs: Params;
	value: Value;
};

type UninitializedMemoizer = {
	previousArgs: null;
	value: null;
};

type BasicMap<T, U> = Pick<Map<T, U>, 'get' | 'clear' | 'delete' | 'size'> & {
	set(key: T, value: U): BasicMap<T, U>;
};

class AnyMap<T, U> implements BasicMap<T, U> {
	private readonly primitiveMap = new Map<T, U>();

	private referenceMap = new WeakMap<object, U>();
	private referenceMapCount = 0;

	clear(): void {
		this.primitiveMap.clear();
		this.referenceMap = new WeakMap<object, U>();
		this.referenceMapCount = 0;
	}
	delete(key: T): boolean {
		if (this.isReferenceable(key)) {
			this.referenceMapCount--;
			return this.referenceMap.delete(key);
		}
		return this.primitiveMap.delete(key);
	}
	has(key: T): boolean {
		if (this.isReferenceable(key)) {
			return this.referenceMap.has(key);
		}
		return this.primitiveMap.has(key);
	}
	set(key: T, value: U): this {
		if (this.isReferenceable(key)) {
			if (!this.referenceMap.has(key)) {
				this.referenceMapCount++;
			}
			this.referenceMap.set(key, value);
		} else {
			this.primitiveMap.set(key, value);
		}
		return this;
	}
	get(key: T): U | undefined {
		if (this.isReferenceable(key)) {
			this.referenceMapCount--;
			return this.referenceMap.get(key);
		}
		return this.primitiveMap.get(key);
	}
	get size(): number {
		return this.primitiveMap.size + this.referenceMapCount;
	}

	private isReferenceable(key: unknown): key is object {
		return typeof key === 'object';
	}
}

// biome-ignore lint/suspicious/noExplicitAny: Must allow any for generic function
export function memoize<Fn extends (...args: any[]) => any>(fn: Fn): Fn {
	const memoizer: Memoizer<Parameters<Fn>, ReturnType<Fn>> = {
		previousArgs: null,
		value: null,
	};

	function memoized(...args: Parameters<Fn>): ReturnType<Fn> {
		if (isInitializedMemoizer(memoizer) && deepEquals(args, memoizer.previousArgs)) {
			return memoizer.value;
		}

		memoizer.previousArgs = args;

		memoizer.value = fn.apply(fn, args);

		return memoizer.value as ReturnType<Fn>;
	}

	// @ts-ignore
	return memoized;
}

// biome-ignore lint/suspicious/noExplicitAny: Must allow any for generic function
function isInitializedMemoizer<P extends any[], R>(memoizer: Memoizer<P, R>): memoizer is InitializedMemoizer<P, R> {
	return memoizer.previousArgs !== null;
}

function deepEquals(x: unknown, y: unknown): x is typeof y {
	const [typeX, typeY] = [typeof x, typeof y];

	if (typeX !== typeY) {
		return false;
	}

	switch (typeX) {
		case 'bigint':
		case 'boolean':
		case 'number':
		case 'string':
		case 'symbol':
		case 'undefined':
		case 'function':
			return x === y;

		case 'object':
			if (x === y) {
				return true;
			}
	}

	try {
		if (Array.isArray(x) && Array.isArray(y)) {
			return x.length === y.length && !any(x.keys(), (i: number) => x[i] !== y[i]);
		}

		// TODO: Deep object analysis
	} catch (err) {
		// ignore, move on to next strategy
	}

	try {
		return JSON.stringify(x) === JSON.stringify(y);
	} catch (err) {
		return x === y;
	}
}
