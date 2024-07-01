import { WorkOS } from '@workos-inc/node';
import { AuthorizationURLOptions } from '@workos-inc/node/lib/user-management/interfaces/authorization-url-options.interface';
import { AuthorizationOptions, ExchangeOptions, OAuthClient, RefreshOptions, ScreenHintType, UserAuthenticationState } from './client';

export class WorkOSOAuthClient extends OAuthClient {
	constructor(private readonly workos: WorkOS) {
		super();
	}

	async exchangeCode({ clientId, code, ...options }: ExchangeOptions): Promise<UserAuthenticationState> {
		return this.workos.userManagement.authenticateWithCode({
			clientId,
			code,
			...options,
		});
	}

	getAuthorizationUrl({ screenHint, ...options }: AuthorizationOptions): string {
		return this.workos.userManagement.getAuthorizationUrl({
			...options,
			screenHint: this.coerceScreenHint(screenHint),
		});
	}

	async refresh(options: RefreshOptions): Promise<UserAuthenticationState> {
		return this.workos.userManagement.authenticateWithRefreshToken(options);
	}

	private coerceScreenHint(screenHint?: ScreenHintType): AuthorizationURLOptions['screenHint'] {
		return screenHint ? (screenHint === 'SignUp' ? 'sign-up' : 'sign-in') : undefined;
	}
}
