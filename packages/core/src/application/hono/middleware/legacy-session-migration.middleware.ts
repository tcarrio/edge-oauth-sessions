import { WithCookies } from '@eos/application/hono/types';
import { Middleware } from './middleware';
import { Next } from 'hono';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { ResponseCookies } from '@eos/application/http/response-cookies';

/**
 * Middleware that attaches the Authorization header to the request if the user is authenticated.
 */
export class LegacySessionMigrationMiddleware extends Middleware {
	public constructor(private readonly config: LegacySessionMigrationConfig) {
		super();
	}

	async handle(ctx: WithCookies, next: Next): Promise<void> {
		// no migration to do if we already set an auth session cookie
		if (ctx.var.cookies[this.config.authSessionKey]) {
			return await next();
		}

		// capture in the incoming request session cookie
		const requestLegacySessionId = ctx.var.cookies[this.config.legacyKey];

		await next();

		const responseCookies = ResponseCookies.fromHeaders(ctx.res.headers);

		let responseLegacySessionId = responseCookies.has(this.config.legacyKey)
			? responseCookies.get(this.config.legacyKey)
			: null;

		if (requestLegacySessionId || responseLegacySessionId) {
			setCookie(ctx, this.config.authSessionKey, (responseLegacySessionId?.value ?? requestLegacySessionId)!);
		}
	}
}


export const LegacySessionMigrationConfigSchema = z.object({
	legacyKey: z.string(),
	authSessionKey: z.string(),
});

export type LegacySessionMigrationConfig = z.infer<typeof LegacySessionMigrationConfigSchema>;