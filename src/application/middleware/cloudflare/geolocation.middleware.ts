import { IRequest } from "itty-router";
import { requestIsGeographicInformation } from "./request";
import { sanitizeHeader } from '../../http/sanitize-headers';
import { Middleware } from '../middleware';

/**
 * Middleware that adds geographic information headers to the request when
 * they are detected.
 *
 * https://developers.cloudflare.com/workers/examples/geolocation-hello-world/
 */
export class GeolocationMiddleware extends Middleware {
	async handle(request: IRequest): Promise<void> {
		if (!requestIsGeographicInformation(request)) {
			return;
		}

		if (request.cf.city) {
			request.headers.set('X-Geo-City', sanitizeHeader(request.cf.city));
		}
		if (request.cf.postalCode) {
			request.headers.set('X-Geo-Postal-Code', sanitizeHeader(request.cf.postalCode));
		}
		if (request.cf.region) {
			request.headers.set('X-Geo-Region', sanitizeHeader(request.cf.region));
		}
		if (request.cf.regionCode) {
			request.headers.set('X-Geo-Region-Code', sanitizeHeader(request.cf.regionCode));
		}
		if (request.cf.asn) {
			request.headers.set('Cf-ASN', String(request.cf.asn));
		}
	}
}