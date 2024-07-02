import { IRequest } from "itty-router";
import { requestIsBotManagementEnterprise } from "../@types/request";
import { Middleware } from "./middleware";

/**
 * Middleware that adds the Cloudflare bot scoring headers to the request
 * when they are detected.
 */
export class BotScoringMiddleware extends Middleware {
	static readonly BOT_SCORE_HEADER = "Cf-Bot-Score";
	static readonly VERIFIED_BOT_HEADER = "Cf-Verified-Bot";

	async handle(request: IRequest): Promise<void> {
		if (!requestIsBotManagementEnterprise(request)) {
			return;
		}

		request.headers.set(BotScoringMiddleware.BOT_SCORE_HEADER, String(request.cf.botManagement.score));
		request.headers.set(BotScoringMiddleware.VERIFIED_BOT_HEADER, String(request.cf.botManagement.verifiedBot));
	}
}
