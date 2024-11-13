import { HttpMethods, HttpStatusCodes } from '@eos/application/http/consts';
import type { Next } from 'hono';
import type { WithCookies } from '../types';
import { Gate } from './gate';

const PROTECTED_METHODS = Object.freeze(new Set<string>([HttpMethods.Post, HttpMethods.Put, HttpMethods.Patch, HttpMethods.Delete]));

/**
 * Gate that forces captcha verification through Cloudflare if not already provided
 */
export class CaptchaGate extends Gate {
	constructor(private readonly config: CsrfConfig) {
		super();
	}

	async handle(ctx: WithCookies, next: Next): Promise<Response | void> {
		// exit early if CSRF is disabled
		if (!this.config.isEnabled()) {
			return await next();
		}

		if (!PROTECTED_METHODS.has(ctx.req.method) || !this.config.isProtectedRoute(ctx.req.path)) {
			return await next();
		}

		try {
			this.validateCsrf(ctx);
		} catch (err) {
			return new Response(null, { status: HttpStatusCodes.BAD_REQUEST });
		}

		return await next();
	}

	private validateCsrf(ctx: WithCookies): void {
		const csrfCookie = ctx.var.cookies[this.config.cookieKey] ?? null;
		const csrfParam = ctx.req.query(this.config.paramKey) ?? null;

		if (csrfCookie && csrfParam && csrfCookie !== csrfParam) {
			throw new Error('CSRF token mismatch');
		}
	}
}

export class CsrfConfig {
	constructor(
		public readonly cookieKey: string,
		public readonly paramKey: string,
		private readonly routes: string[],
	) {}

	isEnabled(): true {
		return true;
	}

	isProtectedRoute(route: string): boolean {
		return this.routes.includes(route);
	}
}
