import { WithCookies } from "../@types/request";
import { Gate } from "./gate";
import { challengeWithCaptcha, hasPassedCaptcha } from "../util/captcha";
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
