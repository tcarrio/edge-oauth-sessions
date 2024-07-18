import { WithCookies } from "@eos/application/types";
import { Gate } from "./gate";
import { withCookies } from "itty-router";

/**
 * Gate that forces captcha verification through Cloudflare if not already provided
 */
export class CaptchaGate extends Gate {
	async handle(request: WithCookies): Promise<Response|void> {
		withCookies(request); // ensure cookies are available

		if (hasPassedCaptcha(request)) {
			return;
		}

		return challengeWithCaptcha();
	}
}

const CHALLENGE_HEADER = 'cf-challenge';
const CHALLENGE_VALUE = 'captcha';

export function challengeWithCaptcha(): Response {
	return new Response(null, {
		status: 403,
		headers: {
			[CHALLENGE_HEADER]: CHALLENGE_VALUE,
		},
	});
}

const CAPTCHA_CLEARANCE = 'cf_clearance';

export function hasPassedCaptcha({ cookies }: WithCookies): boolean {
	return Boolean(cookies[CAPTCHA_CLEARANCE]);
}
