import { WithCookies } from '@eos/application/hono/types';
import { AuthSessionManagerFactory } from '@eos/domain/sessions/auth-session-manager';
import { Middleware } from './middleware';
import { Next } from 'hono';

/**
 * Middleware that attaches the Authorization header to the request if the user is authenticated.
 */
export class AuthSessionMiddleware extends Middleware {
	private static readonly AUTHORIZATION_HEADER = 'Authorization';
	private static readonly AUTH_SESSION_KEY = 'auth-session-id';

	public constructor(private readonly authSessionManagerFactory: AuthSessionManagerFactory) {
		super();
	}

	async handle(ctx: WithCookies, next: Next): Promise<void> {
		const sessionId = ctx.var.cookies[AuthSessionMiddleware.AUTH_SESSION_KEY];
		if (!sessionId) {
			return await next();
		}

		const authSessionManager = this.authSessionManagerFactory.forId(sessionId);

		const session = await authSessionManager.authenticate(sessionId);
		if (!session) {
			return await next();
		}

		const { accessToken } = session;
		if (!accessToken) {
			return await next();
		}

		ctx.req.raw.headers.set(AuthSessionMiddleware.AUTHORIZATION_HEADER, `Bearer ${accessToken}`);

		return await next();
	}
}
