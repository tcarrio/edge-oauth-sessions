export abstract class StatefulHandler implements IStatefulHandler {
	abstract handle(request: Request): Promise<Response>;

	bind(): Handler {
		return this.handle.bind(this);
	}
}

export interface IStatefulHandler {
	handle: Handler;
}

export interface Handler {
	(request: Request): Promise<Response>;
}
