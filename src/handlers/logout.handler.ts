import { HttpStatusCodes } from '../@types/http';
import { WithCookies } from '../@types/request';
import { AUTH_SESSION_KEY } from '../consts';
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

	async handle({ cookies }: WithCookies): Promise<Response> {
		try {
			const authSessionId = cookies[AUTH_SESSION_KEY];

			if (!authSessionId) {
				return new Response(null, { status: HttpStatusCodes.BAD_REQUEST });
			}

			await this.authSessionManagerFactory.forId(authSessionId).logout(authSessionId);
		} catch (err) {
			console.error(err);

			return new Response(null, { status: HttpStatusCodes.INTERNAL_SERVER_ERROR });
		}

		return new Response(null, { status: HttpStatusCodes.NO_CONTENT });
	}
}
