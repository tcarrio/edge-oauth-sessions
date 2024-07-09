import { any } from "./array";

type Memoizer<Params extends any[] = any[], Value = any> = InitializedMemoizer<Params, Value> | UninitializedMemoizer;

type InitializedMemoizer<Params extends any[], Value> = {
	previousArgs: Params;
	value: Value;
}

type UninitializedMemoizer = {
	previousArgs: null;
	value: null;
}

export function memoize<Fn extends (...args: any[]) => any,>(fn: Fn): Fn {
	const memoizer: Memoizer<Parameters<Fn>, ReturnType<Fn>> = { previousArgs: null, value: null };

	function memoized(...args: Parameters<Fn>): ReturnType<Fn> {
		if (isInitializedMemoizer(memoizer) && deepEquals(args, memoizer.previousArgs)) {
			return memoizer.value;
		}

		memoizer.previousArgs = args;

		// @ts-ignore
		memoizer.value = fn.apply(fn, args);

		return memoizer.value!;
	};

	// @ts-ignore
	return memoized;
}

function isInitializedMemoizer<P extends any[], R>(memoizer: Memoizer<P, R>): memoizer is InitializedMemoizer<P, R> {
	return memoizer.previousArgs !== null;
}

// TODO: Expand for actual deepEquals capability
function deepEquals(x: any, y: any): x is typeof y {
	const [typeX, typeY] = [typeof x, typeof y];

	if (typeX !== typeY) {
		return false;
	}

	switch (typeX) {
		case "bigint":
		case "boolean":
		case "number":
		case "string":
		case "symbol":
		case "undefined":
		case "function":
			return x === y;

		case "object":
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
