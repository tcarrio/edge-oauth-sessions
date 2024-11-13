import { memoize } from '@eos/domain/functional/memoize';
import type { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';
import { Middleware } from './middleware';

/**
 * A middleware that injects cookies into the context variables
 *
 * Accessible via `ctx.var.cookies` in all downstream handlers
 *
 * @example
 * ```typescript
 * (c: Context) => {
 *   return c.res.text(`Your access token was ${c.var.cookies.authorization}`);
 * }
 * ```
 */
export class WithCookiesMiddleware extends Middleware {
	async handle(ctx: Context, next: Next): Promise<void> {
		// Only apply the cookies proxy object if it hasn't yet been set
		if (!ctx.var.cookies) {
			ctx.set(
				'cookies',
				new Proxy(ctx, {
					get(target, prop) {
						return getCookie(target, prop.toString());
					},
				}),
			);
		}

		await next();
	}
}

export type WithCookies<T> = T & {
	var: {
		cookies: Record<string, string | undefined>;
	};
};
