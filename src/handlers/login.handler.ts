import { IRequest } from 'itty-router';
import { StatefulHandler } from './handler';
import { OAuthClient } from '../oauth/client';
import { OAuthConfig } from '../oauth/config';
import { UuidFactory } from '../util/uuid';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LoginHandler extends StatefulHandler {
	private static readonly POST_HANDLER_URL_PARAM = 'postRedirectUrl';
	private static readonly DEFAULT_POST_HANDLER_URL = '/';

	constructor(private readonly oauthConfig: OAuthConfig, private readonly oauthClient: OAuthClient) {
		super();
	}

	async handle(request: IRequest): Promise<Response> {
		const state = UuidFactory.random();

		const { [LoginHandler.POST_HANDLER_URL_PARAM]: targetUrl = LoginHandler.POST_HANDLER_URL_PARAM } = request.params;

		const { clientId, redirectUri } = this.oauthConfig;

		const authorizationUrl = this.oauthClient.getAuthorizationUrl({ targetUrl, clientId, redirectUri });

		return new Response(null, { headers: { } , status: 301 });
	}
}
