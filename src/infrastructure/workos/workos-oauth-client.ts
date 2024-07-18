import {
	AuthorizationUrlOptions,
	ExchangeCodeOptions,
	OpenIDConnectClient,
	RefreshOptions,
	ScreenHintType,
} from '@eos/domain/open-id-connect/client';
import { BaseOAuthOptions } from '@eos/domain/open-id-connect/types';
import { SessionState } from '@eos/domain/sessions/session-state';
import { WorkOS } from '@workos-inc/node';
import type { AuthorizationURLOptions } from '@workos-inc/node/lib/user-management/interfaces/authorization-url-options.interface';

export class WorkOSOAuthClient implements OpenIDConnectClient {
	constructor(private readonly workOS: WorkOS, private readonly options: WorkOSOAuthOptions) {}

	getAuthorizationUrl({ screenHint, ...options }: AuthorizationUrlOptions): string {
		return this.workOS.userManagement.getAuthorizationUrl({
			...options,
			clientId: options.client_id ?? this.options.authorization.client_id ?? this.options.clientId,
			redirectUri: options.redirect_uri ?? this.options.authorization.redirect_uri,
			screenHint: this.coerceScreenHint(screenHint),
		});
	}

	async exchangeCode({ clientId = this.options.clientId, code, ...options }: ExchangeCodeOptions): Promise<SessionState> {
		return this.workOS.userManagement.authenticateWithCode({
			clientId,
			code,
			...options,
		});
	}

	async refresh({ refresh_token, client_id = this.options.clientId, ...options }: RefreshOptions): Promise<SessionState> {
		return this.workOS.userManagement.authenticateWithRefreshToken({
			...options,
			clientId: client_id,
			refreshToken: refresh_token,
		});
	}

	private coerceScreenHint(screenHint?: ScreenHintType): AuthorizationURLOptions['screenHint'] {
		return screenHint ? (screenHint === 'SignUp' ? 'sign-up' : 'sign-in') : undefined;
	}
}

export interface WorkOSOAuthOptions extends BaseOAuthOptions {
	apiKey: string;
}
