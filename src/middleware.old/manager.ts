import { RequestWithCookies } from "../requests/cookies";
import { IMiddleware } from "./middleware";

export class MiddlewareManager {
	private readonly middlewares: IMiddleware[] = [];

	use(...middleware: IMiddleware[]) {
		this.middlewares.push(...middleware);
	}

	async handle(request: RequestWithCookies, response: Response) {
		for (const middleware of this.middlewares) {
			[request, response] = await middleware.handle(request, response);
		}

		return response;
	}
}
