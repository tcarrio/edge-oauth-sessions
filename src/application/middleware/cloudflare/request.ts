import { IRequest } from "itty-router";
import { any } from '@eos/domain/functional/array';

export type WithBotManagementEnterprise<Req extends IRequest = IRequest> = Req & { cf: IncomingRequestCfPropertiesBotManagementEnterprise };
export type WithGeographicInformation<Req extends IRequest = IRequest> = Req & { cf: IncomingRequestCfPropertiesGeographicInformation };
export type WithCloudflareAccessOrApiShield<Req extends IRequest = IRequest> = Req & { cf: IncomingRequestCfPropertiesCloudflareAccessOrApiShield };

export function requestIsBotManagementEnterprise<Req extends IRequest>(request: Req): request is WithBotManagementEnterprise<Req> {
	return !!request.cf?.botManagement;
}

export function requestIsGeographicInformation<Req extends IRequest>(request: Req): request is WithGeographicInformation<Req> {
	return any(['country', 'city', 'postalCode', 'region', 'regionCode'], (key) => !!request.cf?.[key]);
}

export function requestIsCloudflareAccessOrApiShield<Req extends IRequest>(request: Req): request is WithCloudflareAccessOrApiShield<Req> {
	return !!request.cf?.tlsClientAuth;
}
