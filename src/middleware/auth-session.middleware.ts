import { RequestWithCookies } from '../@types/request';
import { AuthSessionManagerFactory } from '../sessions/auth-session-manager';
import { Middleware } from './middleware';

/**
 * Middleware that attaches the Authorization header to the request if the user is authenticated.
 */
export class AuthSessionMiddleware extends Middleware {
	static readonly AUTH_SESSION_KEY = 'auth-session-id';

	public constructor(private readonly authSessionManagerFactory: AuthSessionManagerFactory) {
		super();
	}

	async handle(request: RequestWithCookies): Promise<void> {
		const sessionId = request.cookies[AuthSessionMiddleware.AUTH_SESSION_KEY];
		if (!sessionId) {
			return;
		}

		const authSessionManager = this.authSessionManagerFactory.forId(sessionId);

		const session = await authSessionManager.authenticate(sessionId);
		if (!session) {
			return;
		}

		const { accessToken } = session;
		if (!accessToken) {
			return;
		}

		request.headers.set('Authorization', `Bearer ${accessToken}`);

		return;
	}
}
