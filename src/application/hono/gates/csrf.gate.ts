import { HttpMethods, HttpStatusCodes } from '@eos/application/http/consts';
import { Next } from 'hono';
import { WithCookies } from '../types';
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
			return next();
		}

		if (!PROTECTED_METHODS.has(ctx.req.method) || !this.config.isProtectedRoute(ctx.req.path)) {
			return next();
		}

		try {
			this.validateCsrf(ctx);
		} catch (err) {
			return new Response(null, { status: HttpStatusCodes.BAD_REQUEST });
		}
	}

	private validateCsrf(ctx: WithCookies): void {
		// TODO
	}
}

export class CsrfConfig {
	constructor(private readonly routes: string[]) {}

	isEnabled(): true {
		return true;
	}

	isProtectedRoute(route: string): boolean {
		return this.routes.includes(route);
	}
}
