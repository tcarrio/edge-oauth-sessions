import type { Context } from "hono";
import { StatefulHandler } from "./handler";

/**
 * Hands off the request to the fetch API, returning the Response for the next middleware to handle.
 */
export class PassthroughProxyHandler extends StatefulHandler {
	public readonly SYMBOL = Symbol(PassthroughProxyHandler.name);

	async handle(ctx: Context): Promise<Response> {
		return fetch(ctx.req.raw);
	}
}
