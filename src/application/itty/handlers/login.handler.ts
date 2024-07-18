import { HttpStatusCodes } from '@eos/application/http/consts';
import { UuidFactory } from '@eos/domain/common/uuid';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { OpenIDConnectConfig } from '@eos/domain/open-id-connect/config';
import { IRequest } from 'itty-router';
import { StatefulHandler } from './handler';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class LoginHandler extends StatefulHandler {
	private static readonly POST_HANDLER_URL_PARAM = 'postRedirectUrl';

	constructor(private readonly openIDConnectConfig: OpenIDConnectConfig, private readonly openIdConnectClient: OpenIDConnectClient) {
		super();
	}

	async handle(request: IRequest): Promise<Response> {
		const state = UuidFactory.random();

		const { [LoginHandler.POST_HANDLER_URL_PARAM]: targetUrl = LoginHandler.POST_HANDLER_URL_PARAM } = request.params;

		const { clientId, redirectUri } = this.openIDConnectConfig;

		const authorizationUrl = this.openIdConnectClient.getAuthorizationUrl({ targetUrl, clientId, redirectUri });

		return new Response(null, { headers: { Location: authorizationUrl } , status: HttpStatusCodes.MOVED_PERMANENTLY });
	}
}
