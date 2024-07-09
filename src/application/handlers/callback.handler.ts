import { HttpStatusCodes } from '@eos/application/http/consts';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { OpenIDConnectConfig } from '@eos/domain/open-id-connect/config';
import { IRequest } from 'itty-router';
import { StatefulHandler } from './handler';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class CallbackHandler extends StatefulHandler {
	constructor(private readonly openIDConnectConfig: OpenIDConnectConfig, private readonly openIDConnectClient: OpenIDConnectClient) {
		super();
	}

	async handle(request: IRequest): Promise<Response> {
		const { ...params } = request.params;

		// TODO Verify state

		const { clientId, redirectUri } = this.openIDConnectConfig;

		return new Response(null, {
			headers: {
				/* postRedirectUrl */
			},
			status: HttpStatusCodes.MOVED_PERMANENTLY,
		});
	}
}
