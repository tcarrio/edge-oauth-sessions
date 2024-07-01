import { RequestWithCookies } from '../requests/cookies';
import { Middleware, MiddlewareHandlerResult } from './middleware';

/**
 * Hands off the request to the fetch API, returning the Response for the next middleware to handle.
 *
 * As a convenience for the next middleware, the original Request is also returned.
 */
export class ProxyMiddleware extends Middleware {
	shouldHandle(_request: RequestWithCookies): boolean {
		return true;
	}

	async handle(request: RequestWithCookies, _response: Response): Promise<MiddlewareHandlerResult> {
		const newRequest = new Request(request);

		const newResponse = await fetch(newRequest);

		return [request, newResponse];
	}
}
