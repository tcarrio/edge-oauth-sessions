import { IRequest } from 'itty-router';
import { Middleware } from './middleware';
import { Context, Next } from 'hono';

/**
 * An example, zero-operation middleware
 */
export class NoOpMiddleware extends Middleware {
	async handle(_ctx: Context, _next: Next): Promise<void> {
		// no-op
	}
}
