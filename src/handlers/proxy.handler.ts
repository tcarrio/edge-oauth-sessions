import { IRequest } from 'itty-router';
import { StatefulHandler } from './handler';

/**
 * Hands off the request to the fetch API, returning the Response for the next middleware to handle.
 */
export class ProxyHandler extends StatefulHandler {
	async handle(request: IRequest): Promise<Response> {
		// TODO wtf
		// @ts-ignore
		return fetch(new Request(request));
	}
}
