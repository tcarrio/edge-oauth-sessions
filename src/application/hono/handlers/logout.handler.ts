import { HttpStatusCodes } from '@eos/application/http/consts';
import { WithCookies } from '../types';
import { AuthSessionManagerFactory } from '@eos/domain/sessions/auth-session-manager';
import { StatefulHandler } from './handler';
import { RouterConfig } from '../../router/config';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LogoutHandler extends StatefulHandler {
	constructor(private readonly authSessionManagerFactory: AuthSessionManagerFactory, private readonly sessionConfig: RouterConfig) {
		super();
	}

	async handle(ctx: WithCookies): Promise<Response> {
		try {
			const authSessionId = ctx.var.cookies[this.sessionConfig.cookieKey];

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
