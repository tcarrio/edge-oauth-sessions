import { IRequest } from "itty-router";

export abstract class Gate implements IGate {
	abstract handle(request: IRequest): any;

	bind(): (request: IRequest) => Promise<void> {
		return async (request: IRequest) => {
			await this.handle(request);
		};
	}
}

export interface IGate {
	handle(request: IRequest): Promise<Response|void>;
}
