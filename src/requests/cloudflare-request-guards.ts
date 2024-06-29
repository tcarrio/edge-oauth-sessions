import { any } from '../util/array';

export function requestIsBotManagementEnterprise<Req extends Request>(
	request: Req
): request is Req & { cf: IncomingRequestCfPropertiesBotManagementEnterprise } {
	return !!request.cf?.botManagement;
}

export function requestIsGeographicInformation<Req extends Request>(
	request: Req
): request is Req & { cf: IncomingRequestCfPropertiesGeographicInformation } {
	return any(['country', 'city', 'postalCode', 'region', 'regionCode'], (key) => !!request.cf?.[key]);
}

export function requestIsCloudflareAccessOrApiShield<Req extends Request>(
	request: Req
): request is Req & { cf: IncomingRequestCfPropertiesCloudflareAccessOrApiShield } {
	return !!request.cf?.tlsClientAuth;
}
