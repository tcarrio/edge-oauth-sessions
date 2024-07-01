import { RequestWithCookies } from "../@types/request";

export abstract class Middleware implements IMiddleware {
	abstract handle(request: RequestWithCookies): Promise<void>;

	bind(): (request: RequestWithCookies) => Promise<void> {
		return async (request: RequestWithCookies) => {
			await this.handle(request);
		};
	}
}

export interface IMiddleware {
	handle(request: RequestWithCookies): Promise<void>;
}
