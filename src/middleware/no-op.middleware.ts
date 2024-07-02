import { IRequest } from 'itty-router';
import { Middleware } from './middleware';

/**
 * An example, zero-operation middleware
 */
export class NoOpMiddleware extends Middleware {
	async handle(_request: IRequest): Promise<void> {}
}
