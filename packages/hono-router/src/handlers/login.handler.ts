import { HttpStatusCodes } from "@eos/application/http/consts";
import { time } from "@eos/domain/common/time";
import type { UuidFactory } from "@eos/domain/common/uuid";
import type { OpenIDConnectClient } from "@eos/domain/open-id-connect/client";
import type { OpenIDConnectConfig } from "@eos/domain/open-id-connect/config";
import type { CookieSecretRepository } from "@eos/domain/sessions/cookie-secret-repository";
import type { Context } from "hono";
import { setCookie, setSignedCookie } from "hono/cookie";
import type { CookieOptions } from "hono/utils/cookie";
import type { RouterConfig } from "../../router/config";
import { StatefulHandler } from "./handler";

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LoginHandler extends StatefulHandler {
	public readonly SYMBOL = Symbol(LoginHandler.name);

	private static readonly POST_HANDLER_URL_PARAM = "postRedirectUrl";
	private static readonly STATE_COOKIE_NAME = "oauth.state";

	constructor(
		private readonly routerConfig: RouterConfig,
		private readonly openIDConnectConfig: OpenIDConnectConfig,
		private readonly openIdConnectClient: OpenIDConnectClient,
		private readonly cookieSecretRepository: CookieSecretRepository,
		private readonly uuidFactory: UuidFactory,
	) {
		super();
	}

	async handle(ctx: Context): Promise<Response> {
		const state = this.uuidFactory.random();

		const {
			[LoginHandler.POST_HANDLER_URL_PARAM]:
				targetUrl = LoginHandler.POST_HANDLER_URL_PARAM,
		} = ctx.req.param();

		const { clientId, redirectUri } = this.openIDConnectConfig;

		const authorizationUrl = this.openIdConnectClient.getAuthorizationUrl({
			targetUrl,
			clientId,
			redirectUri,
			state,
		});

		await this.applyOAuthStateCookie(ctx, state);

		return new Response(null, {
			headers: { Location: authorizationUrl },
			status: HttpStatusCodes.MOVED_PERMANENTLY,
		});
	}

	private async applyOAuthStateCookie(
		ctx: Context,
		state: string,
	): Promise<void> {
		const cookieOptions = this.determineStateCookieOptions();

		try {
			const secret = this.uuidFactory.random();

			await this.cookieSecretRepository.upsert(state, {
				value: secret,
				createdAt: new Date(),
				expiresAt: new Date(Date.now() + 10 * time.Minute),
			});

			setSignedCookie(
				ctx,
				LoginHandler.STATE_COOKIE_NAME,
				state,
				secret,
				cookieOptions,
			);
		} catch (err) {
			// falls back to unsigned cookie if the signed cookie fails
			setCookie(ctx, LoginHandler.STATE_COOKIE_NAME, state, cookieOptions);
		}
	}

	private determineStateCookieOptions(): CookieOptions {
		return {
			path: "/",
			secure: true,
			httpOnly: true,
			maxAge: (10 * time.Minute) / time.Second,
			domain: this.routerConfig.domain,
			sameSite: "strict",
		};
	}
}
