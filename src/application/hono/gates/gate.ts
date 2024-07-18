import { Context, Next } from 'hono';

export abstract class Gate implements IGate {
	abstract handle(ctx: Context, next: Next): Promise<Response | void>;

	bind(): (ctx: Context, next: Next) => Promise<Response | void> {
		return this.handle.bind(this);
	}
}

export interface IGate {
	handle(ctx: Context, next: Next): Promise<Response | void>;
}
