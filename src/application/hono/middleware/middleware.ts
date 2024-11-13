import type { Context, Next } from 'hono';

export abstract class Middleware implements IMiddleware {
	abstract handle(ctx: Context, next: Next): Promise<void>;

	bind(): (ctx: Context, next: Next) => Promise<void> {
		return this.handle.bind(this);
	}
}

export interface IMiddleware {
	handle(ctx: Context, next: Next): Promise<void>;
}
