import { AUTH_SESSION_KEY } from '../consts';
import { RequestWithCookies } from '../requests/cookies';
import { AuthSessionManagerFactory } from '../sessions/auth-session-manager';
import { StatefulHandler } from './handler';
import {withCookies} from 'itty-router';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LogoutHandler extends StatefulHandler {
	constructor(private readonly authSessionManagerFactory: AuthSessionManagerFactory) {
		super();
	}

	async handle({ cookies }: RequestWithCookies): Promise<Response> {
		try {
			const authSessionId = cookies[AUTH_SESSION_KEY];

			if (!authSessionId) {
				return new Response(null, { status: 400 });
			}

			await this.authSessionManagerFactory.forId(authSessionId).logout(authSessionId);
		} catch (err) {
			console.error(err);

			return new Response(null, { status: 500 });
		}

		return new Response(null, { status: 204 });
	}
}
