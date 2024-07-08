import { WorkOS } from '@workos-inc/node';
import { AuthorizationURLOptions } from '@workos-inc/node/lib/user-management/interfaces/authorization-url-options.interface';
import { AuthorizationOptions, ExchangeOptions, OAuthClient, RefreshOptions, ScreenHintType } from './client';
import { BaseOAuthOptions, UserAuthenticationState } from './types';

export class WorkOSOAuthClient implements OAuthClient {
	constructor(private readonly workOS: WorkOS, private readonly options: WorkOSOAuthOptions) {}

	async exchangeCode({ clientId = this.options.clientId, code, ...options }: ExchangeOptions): Promise<UserAuthenticationState> {
		return this.workOS.userManagement.authenticateWithCode({
			clientId,
			code,
			...options,
		});
	}

	getAuthorizationUrl({ screenHint, ...options }: AuthorizationOptions): string {
		return this.workOS.userManagement.getAuthorizationUrl({
			...options,
			screenHint: this.coerceScreenHint(screenHint),
		});
	}

	async refresh({ clientId = this.options.clientId, ...options }: RefreshOptions): Promise<UserAuthenticationState> {
		return this.workOS.userManagement.authenticateWithRefreshToken({
			...options,
			clientId,
		});
	}

	private coerceScreenHint(screenHint?: ScreenHintType): AuthorizationURLOptions['screenHint'] {
		return screenHint ? (screenHint === 'SignUp' ? 'sign-up' : 'sign-in') : undefined;
	}
}

export interface WorkOSOAuthOptions extends BaseOAuthOptions {
	apiKey: string;
}
