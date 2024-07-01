import { requestIsBotManagementEnterprise } from "../requests/cloudflare-request-guards";
import { RequestWithCookies, cloneRequestWithCookies } from "../requests/cookies";
import { Middleware, MiddlewareHandlerResult } from "./middleware";

type BotScoringRequest = RequestWithCookies & { cf: IncomingRequestCfPropertiesBotManagementEnterprise };

/**
 * Middleware that adds bot scoring headers to the request.
 */
export class BotScoringMiddleware extends Middleware {
	static readonly BOT_SCORE_HEADER = "Cf-Bot-Score";
	static readonly VERIFIED_BOT_HEADER = "Cf-Verified-Bot";

	shouldHandle(request: RequestWithCookies): boolean {
		return requestIsBotManagementEnterprise(request);
	}

	async handle(request: BotScoringRequest, response: Response): Promise<MiddlewareHandlerResult> {
		const newRequest = cloneRequestWithCookies(request);
		newRequest.headers.set(BotScoringMiddleware.BOT_SCORE_HEADER, String(request.cf.botManagement.score));
		newRequest.headers.set(BotScoringMiddleware.VERIFIED_BOT_HEADER, String(request.cf.botManagement.verifiedBot));

		return [newRequest, response];
	}
}
