import { IRequest } from "itty-router";

export abstract class Middleware implements IMiddleware {
	abstract handle(request: IRequest): Promise<void>;

	bind(): (request: IRequest) => Promise<void> {
		return async (request: IRequest) => {
			await this.handle(request);
		};
	}
}

export interface IMiddleware {
	handle(request: IRequest): Promise<void>;
}
