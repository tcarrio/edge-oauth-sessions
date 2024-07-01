import { requestIsBotManagementEnterprise } from "../@types/request";
import { Middleware } from "./middleware";

/**
 * Middleware that adds bot scoring headers to the request.
 */
export class BotScoringMiddleware extends Middleware {
	static readonly BOT_SCORE_HEADER = "Cf-Bot-Score";
	static readonly VERIFIED_BOT_HEADER = "Cf-Verified-Bot";

	async handle(request: Request): Promise<void> {
		if (requestIsBotManagementEnterprise(request)) {
			request.headers.set(BotScoringMiddleware.BOT_SCORE_HEADER, String(request.cf.botManagement.score));
			request.headers.set(BotScoringMiddleware.VERIFIED_BOT_HEADER, String(request.cf.botManagement.verifiedBot));
		}
	}
}
