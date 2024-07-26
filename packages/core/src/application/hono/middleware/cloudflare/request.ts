import { any } from '@eos/domain/functional/array';

export type WithBotManagementEnterprise<Req extends Request = Request> = Req & { cf: IncomingRequestCfPropertiesBotManagementEnterprise };
export type WithGeographicInformation<Req extends Request = Request> = Req & { cf: IncomingRequestCfPropertiesGeographicInformation };
export type WithCloudflareAccessOrApiShield<Req extends Request = Request> = Req & { cf: IncomingRequestCfPropertiesCloudflareAccessOrApiShield };

export function requestIsBotManagementEnterprise<Req extends Request>(request: Req): request is WithBotManagementEnterprise<Req> {
	return !!request.cf?.botManagement;
}

export function requestIsGeographicInformation<Req extends Request>(request: Req): request is WithGeographicInformation<Req> {
	return any(['country', 'city', 'postalCode', 'region', 'regionCode'], (key) => !!request.cf?.[key]);
}

export function requestIsCloudflareAccessOrApiShield<Req extends Request>(request: Req): request is WithCloudflareAccessOrApiShield<Req> {
	return !!request.cf?.tlsClientAuth;
}
