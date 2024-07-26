import { HttpStatusCodes } from '@eos/application/http/consts';
import { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { OpenIDConnectConfig } from '@eos/domain/open-id-connect/config';
import { IRequest } from 'itty-router';
import { StatefulHandler } from './handler';
import { Context } from 'hono';

/**
 * Handles logout actions by deleting the session from storage.
 */
export class CallbackHandler extends StatefulHandler {
	constructor(private readonly openIDConnectConfig: OpenIDConnectConfig, private readonly openIDConnectClient: OpenIDConnectClient) {
		super();
	}

	async handle(ctx: Context): Promise<Response> {
		// TODO: Extract params from callback
		const code = ctx.req.param('code');

		// TODO: Determine success or error
		// TODO: Verify state

		const { clientId, clientSecret, redirectUri } = this.openIDConnectConfig;

		// TODO: Exchange code for tokens
		try {
			await this.openIDConnectClient.exchangeCode({
				code,
				grant_type: 'authorization_code',
				client_id: clientId,
				client_secret: clientSecret,
				redirect_uri: redirectUri,
			});

			return new Response(null, {
				headers: {
					/* postRedirectUrl */
				},
				status: HttpStatusCodes.MOVED_PERMANENTLY,
			});
		} catch (err) {
			// TODO: Handle errors
			return ctx.redirect(/* error url */ '/error')
		}
	}
}
