import { IRequest } from "itty-router";

export abstract class StatefulHandler implements IStatefulHandler {
	abstract handle(request: IRequest): Promise<Response>;

	bind(): Handler {
		return this.handle.bind(this);
	}
}

export interface IStatefulHandler {
	handle: Handler;
}

export interface Handler {
	(request: IRequest): Promise<Response>;
}
