import { RequestWithCookies } from '../requests/cookies';
import { Middleware, MiddlewareHandlerResult } from './middleware';

export class NoOpMiddleware extends Middleware {
	shouldHandle(_request: RequestWithCookies): boolean {
		return false;
	}

	async handle(request: RequestWithCookies, response: Response): Promise<MiddlewareHandlerResult> {
		return [request, response];
	}
}
