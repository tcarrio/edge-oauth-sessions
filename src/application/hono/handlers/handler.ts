import type { Context } from "hono";

export abstract class StatefulHandler implements IStatefulHandler {
	abstract handle(ctx: Context): Promise<Response>;

	bind(): Handler {
		return this.handle.bind(this);
	}
}

export interface IStatefulHandler {
	handle: Handler;
}

export type Handler = (ctx: Context) => Promise<Response>;
