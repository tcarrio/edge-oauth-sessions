import type { ExchangeCodeOptions, OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import { OAuthCodeExchangeResponseSchema } from '@eos/domain/open-id-connect/code-exchange';
import type { ISessionState } from '@eos/domain/sessions/session-state';
import { Configuration, OAuth2Api } from '@ory/client-fetch';
import { z } from 'zod';
import { mapperForMapping } from '../common/env-options-mapper';
import type { HttpClient } from '../http/http-client';
import {
	EnvGenericOIDCOptionsSchema,
	GenericOIDCClient,
	type GenericOIDCOptions,
	GenericOIDCOptionsSchema,
} from '../open-id-connect/generic-oidc-client';

export const OryOIDCOptionsSchema = GenericOIDCOptionsSchema.extend({
	apiKey: z.string().min(1),
});

export const EnvOryOIDCOptionsSchema = EnvGenericOIDCOptionsSchema.extend({
	ORY_API_KEY: z.string().min(1),
});

export const mapper = mapperForMapping<OryOIDCOptions, typeof EnvOryOIDCOptionsSchema>({
	ORY_API_KEY: 'apiKey',
	OAUTH_AUTHORIZATION: 'authorization',
	OAUTH_BASE_URL: 'baseURL',
	OAUTH_ISSUER_URL: 'issuerUrl',
	OAUTH_ISSUER_BASE_URL: 'issuerBaseURL',
	OAUTH_CLIENT_ID: 'clientId',
	OAUTH_CLIENT_SECRET: 'clientSecret',
	OAUTH_SECRET: 'secret',
});

export interface OryOIDCOptions extends GenericOIDCOptions {
	apiKey: string;
}
