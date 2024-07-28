import { IRequest } from "itty-router";
import { requestIsBotManagementEnterprise } from "./request";
import { Middleware } from "../middleware";
import type { Context, Next } from "hono";

/**
 * Middleware that adds the Cloudflare bot scoring headers to the request
 * when they are detected.
 */
export class BotScoringMiddleware extends Middleware {
	static readonly BOT_SCORE_HEADER = "Cf-Bot-Score";
	static readonly VERIFIED_BOT_HEADER = "Cf-Verified-Bot";

	async handle(ctx: Context, next: Next): Promise<void> {
		const rawRequest = ctx.req.raw;
		if (requestIsBotManagementEnterprise(rawRequest)) {
			rawRequest.headers.set(
				BotScoringMiddleware.BOT_SCORE_HEADER,
				String(rawRequest.cf.botManagement.score),
			);
			rawRequest.headers.set(
				BotScoringMiddleware.VERIFIED_BOT_HEADER,
				String(rawRequest.cf.botManagement.verifiedBot),
			);
		}

		next();
	}
}
