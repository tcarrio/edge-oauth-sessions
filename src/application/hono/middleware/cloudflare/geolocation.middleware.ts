import { requestIsGeographicInformation } from "./request";
import { sanitizeHeader } from '../../../http/sanitize-headers';
import { Middleware } from '../middleware';
import { Context, Next } from "hono";

/**
 * Middleware that adds geographic information headers to the request when
 * they are detected.
 *
 * https://developers.cloudflare.com/workers/examples/geolocation-hello-world/
 */
export class GeolocationMiddleware extends Middleware {
	async handle(ctx: Context, next: Next): Promise<void> {
		const rawRequest = ctx.req.raw;
		if (!requestIsGeographicInformation(rawRequest)) {
			return next();
		}

		if (rawRequest.cf.city) {
			rawRequest.headers.set('X-Geo-City', sanitizeHeader(rawRequest.cf.city));
		}
		if (rawRequest.cf.postalCode) {
			rawRequest.headers.set('X-Geo-Postal-Code', sanitizeHeader(rawRequest.cf.postalCode));
		}
		if (rawRequest.cf.region) {
			rawRequest.headers.set('X-Geo-Region', sanitizeHeader(rawRequest.cf.region));
		}
		if (rawRequest.cf.regionCode) {
			rawRequest.headers.set('X-Geo-Region-Code', sanitizeHeader(rawRequest.cf.regionCode));
		}
		if (rawRequest.cf.asn) {
			rawRequest.headers.set('Cf-ASN', String(rawRequest.cf.asn));
		}
	}
}
