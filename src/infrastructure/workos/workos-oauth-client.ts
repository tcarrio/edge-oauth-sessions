import type {
	AuthorizationUrlOptions,
	ExchangeCodeOptions,
	OpenIDConnectClient,
	RefreshOptions,
	ScreenHintType,
} from '@eos/domain/open-id-connect/client';
import { type BaseOIDCOptions, BaseOIDCOptionsSchema, EnvBaseOIDCOptionsSchema } from '@eos/domain/open-id-connect/types';
import type { ISessionState } from '@eos/domain/sessions/session-state';
import type { WorkOS } from '@workos-inc/node';
import type { AuthorizationURLOptions } from '@workos-inc/node/lib/user-management/interfaces/authorization-url-options.interface';
import { z } from 'zod';
import { mapperForMapping } from '../common/env-options-mapper';

export class WorkOSOAuthClient implements OpenIDConnectClient {
	constructor(
		private readonly workOS: WorkOS,
		private readonly options: WorkOSOIDCOptions,
	) {}

	getAuthorizationUrl({ screenHint, ...options }: AuthorizationUrlOptions): string {
		return this.workOS.userManagement.getAuthorizationUrl({
			...options,
			clientId: options.client_id ?? this.options.authorization.client_id ?? this.options.clientId,
			redirectUri: options.redirect_uri ?? this.options.authorization.redirect_uri,
			screenHint: this.coerceScreenHint(screenHint),
		});
	}

	async exchangeCode({ clientId = this.options.clientId, code, ...options }: ExchangeCodeOptions): Promise<ISessionState> {
		return this.workOS.userManagement.authenticateWithCode({
			clientId,
			code,
			...options,
		});
	}

	async refresh({ refresh_token, client_id = this.options.clientId, ...options }: RefreshOptions): Promise<ISessionState> {
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

export const WorkOSOIDCOptionsSchema = z
	.object({
		apiKey: z.string().min(1),
	})
	.merge(BaseOIDCOptionsSchema);

export const EnvWorkOSOIDCOptionsSchema = z
	.object({
		WORKOS_API_KEY: z.string().min(1),
	})
	.merge(EnvBaseOIDCOptionsSchema);

export const mapper = mapperForMapping<WorkOSOIDCOptions, typeof EnvWorkOSOIDCOptionsSchema>({
	OAUTH_AUTHORIZATION: 'authorization',
	OAUTH_CLIENT_ID: 'clientId',
	OAUTH_CLIENT_SECRET: 'clientSecret',
	OAUTH_ISSUER_URL: 'issuerUrl',
	WORKOS_API_KEY: 'apiKey',
});

export interface WorkOSOIDCOptions extends BaseOIDCOptions {
	apiKey: string;
}
