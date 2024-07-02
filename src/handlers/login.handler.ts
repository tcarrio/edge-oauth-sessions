import { StatefulHandler } from './handler';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LoginHandler extends StatefulHandler {
	async handle(_request: Request): Promise<Response> {
		// TODO: Implement

		return new Response(null, { status: 404 });
	}
}
