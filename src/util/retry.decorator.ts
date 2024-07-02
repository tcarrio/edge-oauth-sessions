export interface RetryOptions {
	maxRetries?: number;
	delay?: number;
}

const DEFAULTS: Required<RetryOptions> = {
	maxRetries: 3,
	delay: 500,
} as const;

export function Retry({ maxRetries = DEFAULTS.maxRetries, delay = DEFAULTS.delay }: RetryOptions = {}): MethodDecorator {
	return function <F>(
		_target: Object,
		_propertyKey: string | symbol,
		descriptor: TypedPropertyDescriptor<F>
	): void | TypedPropertyDescriptor<F> {
		const originalMethod = descriptor.value;

		if (typeof originalMethod !== 'function' || !originalMethod) {
			return;
		}

		// @ts-ignore
		descriptor.value = async function (...args: (Parameters<F>)): Promise<ReturnType<F>> {
			let attempt = 0;
			while (attempt < maxRetries) {
				try {
					// @ts-ignore
					return await originalMethod.apply(this, args);
				} catch (error) {
					attempt++;
					if (attempt >= maxRetries) {
						throw error;
					}

					await new Promise((resolve) => setTimeout(resolve, delay));
				}
			}

			throw new Error(`Failed to complete successfully in ${maxRetries}`);
		};

		return descriptor;
	};
}
