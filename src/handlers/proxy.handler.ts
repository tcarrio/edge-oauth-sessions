import { StatefulHandler } from './handler';

/**
 * Hands off the request to the fetch API, returning the Response for the next middleware to handle.
 */
export class ProxyHandler extends StatefulHandler {
	async handle(request: Request): Promise<Response> {
		return fetch(request);
	}
}
