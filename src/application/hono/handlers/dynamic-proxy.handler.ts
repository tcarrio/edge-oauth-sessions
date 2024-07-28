import type { Context } from "hono";
import { StatefulHandler } from "./handler";
import { HttpStatusCodes } from "@eos/application/http/consts";

/**
 * Hands off the request to the fetch API, returning the Response for the next middleware to handle.
 */
export class DynamicProxyHandler extends StatefulHandler {
	constructor(private readonly target: DynamicProxyConfig = {}) {
		super();
	}

	async handle(ctx: Context): Promise<Response> {
		const { hostname, port, protocol } = this.target;

		const url = new URL(ctx.req.raw.url);
		const overrideHeaders: Record<string, string> = {};

		if (hostname) {
			url.hostname = hostname;
			overrideHeaders.Host = hostname;
		}

		if (port) {
			url.port = port;
		}

		if (protocol) {
			url.protocol = protocol;
		}

		Object.entries(overrideHeaders).forEach(([key, value]) =>
			ctx.req.raw.headers.set(key, value),
		);

		try {
			console.log(`Proxying to ${url.toString()}`);

			return await fetch(url.toString(), ctx.req.raw);
		} catch (err) {
			console.error(err);
		}

		return new Response(null, {
			status: HttpStatusCodes.INTERNAL_SERVER_ERROR,
		});
	}
}

export interface DynamicProxyConfig {
	protocol?: string;
	hostname?: string;
	port?: string;
}
