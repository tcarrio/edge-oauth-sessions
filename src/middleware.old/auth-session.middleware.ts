import { RequestWithCookies, cloneRequestWithCookies } from '../requests/cookies';
import { AuthSessionManagerFactory } from '../sessions/auth-session-manager';
import { Middleware, MiddlewareHandlerResult } from './middleware';

/**
 * Middleware that attaches the Authorization header to the request if the user is authenticated.
 */
export class AuthSessionMiddleware extends Middleware {
	static readonly AUTH_SESSION_KEY = 'auth-session-id';

	public constructor(private readonly authSessionManagerFactory: AuthSessionManagerFactory) {
		super();
	}

	shouldHandle(request: RequestWithCookies): boolean {
		return !!request.cookies.get(AuthSessionMiddleware.AUTH_SESSION_KEY);
	}

	async handle(request: RequestWithCookies, response: Response): Promise<MiddlewareHandlerResult> {
		const skipped: MiddlewareHandlerResult = [request, response];

		const sessionId = request.cookies.get(AuthSessionMiddleware.AUTH_SESSION_KEY);
		if (!sessionId) {
			return skipped;
		}

		const authSessionManager = this.authSessionManagerFactory.forId(sessionId);

		const session = await authSessionManager.authenticate(sessionId);
		if (!session) {
			return skipped;
		}

		const { accessToken } = session;
		if (!accessToken) {
			return skipped;
		}

		const newRequest = cloneRequestWithCookies(request);
		newRequest.headers.set('Authorization', `Bearer ${accessToken}`);

		return [newRequest, response];
	}
}
