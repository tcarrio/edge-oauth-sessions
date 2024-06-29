import { requestIsGeographicInformation } from '../requests/cloudflare-request-guards';
import { RequestWithCookies, cloneRequestWithCookies } from '../requests/cookies';
import { sanitizeHeader } from '../requests/headers';
import { Middleware, MiddlewareHandlerResult } from './middleware';

type GeographicInformationRequest = RequestWithCookies & { cf: IncomingRequestCfPropertiesGeographicInformation };

/**
 * Middleware that adds geographic information headers to the request.
 *
 * https://developers.cloudflare.com/workers/examples/geolocation-hello-world/
 */
export class GeolocationMiddleware extends Middleware {
	shouldHandle(request: RequestWithCookies): boolean {
		return requestIsGeographicInformation(request);
	}

	async handle(request: GeographicInformationRequest, response: Response): Promise<MiddlewareHandlerResult> {
		const newRequest = cloneRequestWithCookies(request);

		if (request.cf.city) {
			newRequest.headers.set('X-Geo-City', sanitizeHeader(request.cf.city));
		}
		if (request.cf.postalCode) {
			newRequest.headers.set('X-Geo-Postal-Code', sanitizeHeader(request.cf.postalCode));
		}
		if (request.cf.region) {
			newRequest.headers.set('X-Geo-Region', sanitizeHeader(request.cf.region));
		}
		if (request.cf.regionCode) {
			newRequest.headers.set('X-Geo-Region-Code', sanitizeHeader(request.cf.regionCode));
		}
		if (request.cf.asn) {
			newRequest.headers.set('Cf-ASN', String(request.cf.asn));
		}

		return [newRequest, response];
	}
}
