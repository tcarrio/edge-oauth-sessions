import { HttpMethods, HttpStatusCodes } from "../@types/http";
import { WithCookies } from "../@types/request";
import { Gate } from "./gate";
import { withCookies } from "itty-router";

const PROTECTED_METHODS = Object.freeze(new Set<string>([
	HttpMethods.Post,
	HttpMethods.Put,
	HttpMethods.Patch,
	HttpMethods.Delete,
]));

/**
 * Gate that forces captcha verification through Cloudflare if not already provided
 */
export class CaptchaGate extends Gate {
	constructor(private readonly config: CsrfConfig) {
		super();
	}

	async handle(request: WithCookies): Promise<Response|void> {
		// exit early if CSRF is disabled
		if (!this.config.isEnabled()) {
			return;
		}

		// ensure cookies are present on the request
		withCookies(request);


		if (!PROTECTED_METHODS.has(request.method) || !this.config.isProtectedRoute(request.route)) {
			return;
		}

		try {
			this.validateCsrf(request);
		} catch (err) {
			return new Response(null, { status: HttpStatusCodes.BAD_REQUEST });
		}
	}

	private validateCsrf(request: WithCookies): void {
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
