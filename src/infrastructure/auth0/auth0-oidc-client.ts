import type {
	AuthorizationUrlOptions,
	ExchangeCodeOptions,
	OIDCScopeType,
	OpenIDConnectClient,
	RefreshOptions,
	ScreenHintType,
} from "@eos/domain/open-id-connect/client";
import { OAuthCodeExchangeResponseSchema } from "@eos/domain/open-id-connect/code-exchange";
import {
	type BaseOIDCOptions,
	BaseOIDCOptionsSchema,
	EnvBaseOIDCOptionsSchema,
} from "@eos/domain/open-id-connect/types";
import type { ISessionState } from "@eos/domain/sessions/session-state";
import type { AuthenticationClient } from "auth0";
import { z } from "zod";
import { mapperForMapping } from "../common/env-options-mapper";

export class Auth0OIDCClient implements OpenIDConnectClient {
	private static readonly DEFAULT_SCOPES: OIDCScopeType[] = [
		"openid",
		"profile",
		"email",
	];

	constructor(
		private readonly auth0: AuthenticationClient,
		private readonly baseAuthorizationUrl: string,
	) {}

	getAuthorizationUrl({
		clientId,
		redirectUri,
		screenHint,
		...options
	}: AuthorizationUrlOptions): string {
		const url = new URL(this.baseAuthorizationUrl);

		url.search = new URLSearchParams({
			...options,
			...this.coerceScreenHintOption(screenHint),
			scope: (options.scope ?? Auth0OIDCClient.DEFAULT_SCOPES).toString(),
			response_type: "code",
			client_id: clientId,
			redirect_uri: redirectUri,
		}).toString();

		return url.toString();
	}

	async exchangeCode({
		clientId,
		code,
		...options
	}: ExchangeCodeOptions): Promise<ISessionState> {
		const { data } = await this.auth0.oauth.authorizationCodeGrant({
			client_id: clientId,
			code,
			...options,
		});

		const { access_token, id_token, refresh_token } =
			OAuthCodeExchangeResponseSchema.parse(data);

		return {
			accessToken: access_token,
			idToken: id_token,
			refreshToken: refresh_token,
		};
	}

	async refresh({
		client_id,
		refresh_token,
		...options
	}: RefreshOptions): Promise<ISessionState> {
		const { data } = await this.auth0.oauth.refreshTokenGrant({
			...options,
			refresh_token,
			client_id,
		});

		return {
			accessToken: data.access_token,
			idToken: data.id_token,
			// Auth0 supports refresh token rotation, but if not returned we continue using the old one
			refreshToken: data.refresh_token ?? refresh_token,
		};
	}

	private coerceScreenHintOption(
		screenHint?: ScreenHintType,
	): Partial<Record<"screen_hint", string>> {
		return screenHint
			? { screen_hint: screenHint === "SignIn" ? "login" : "signup" }
			: {};
	}
}

export const Auth0OIDCOptionsSchema = z
	.object({
		domain: z.string(),
		authorizationUri: z.string().url(),
		refreshUri: z.string().url(),
	})
	.merge(BaseOIDCOptionsSchema);

export const EnvAuth0OIDCOptionsSchema = z
	.object({
		OAUTH_DOMAIN: z.string(),
		OAUTH_AUTHORIZATION_URI: z.string().url(),
		OAUTH_REFRESH_URI: z.string().url(),
	})
	.merge(EnvBaseOIDCOptionsSchema);

export const mapper = mapperForMapping<
	Auth0OIDCOptions,
	typeof EnvAuth0OIDCOptionsSchema
>({
	OAUTH_AUTHORIZATION: "authorization",
	OAUTH_AUTHORIZATION_URI: "authorizationUri",
	OAUTH_CLIENT_ID: "clientId",
	OAUTH_CLIENT_SECRET: "clientSecret",
	OAUTH_DOMAIN: "domain",
	OAUTH_ISSUER_URL: "issuerUrl",
	OAUTH_REFRESH_URI: "refreshUri",
});

export interface Auth0OIDCOptions extends BaseOIDCOptions {
	domain: string;
	authorizationUri: string;
	refreshUri: string;
}
