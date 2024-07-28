import { HttpStatusCodes } from "@eos/application/http/consts";
import type { Next } from "hono";
import type { WithCookies } from "../types";
import { Gate } from "./gate";

/**
 * Gate that forces captcha verification through Cloudflare if not already provided
 */
export class CaptchaGate extends Gate {
	async handle(ctx: WithCookies, next: Next): Promise<Response | void> {
		if (hasPassedCaptcha(ctx)) {
			return await next();
		}

		return challengeWithCaptcha();
	}
}

const CHALLENGE_HEADER = "cf-challenge";
const CHALLENGE_VALUE = "captcha";

export function challengeWithCaptcha(): Response {
	return new Response(null, {
		status: HttpStatusCodes.FORBIDDEN,
		headers: {
			[CHALLENGE_HEADER]: CHALLENGE_VALUE,
		},
	});
}

const CAPTCHA_CLEARANCE = "cf_clearance";

export function hasPassedCaptcha(ctx: WithCookies): boolean {
	return Boolean(ctx.var.cookies[CAPTCHA_CLEARANCE]);
}
