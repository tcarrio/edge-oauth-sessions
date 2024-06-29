import { RequestWithCookies } from "../requests/cookies";

export abstract class Middleware {
	abstract shouldHandle(request: RequestWithCookies): boolean;
	abstract handle(request: RequestWithCookies, response: Response): Promise<MiddlewareHandlerResult>;
}

export interface IMiddleware {
	shouldHandle(request: RequestWithCookies): boolean;
	handle(request: RequestWithCookies, response: Response): Promise<MiddlewareHandlerResult>;
}

export type MiddlewareHandlerResult = [RequestWithCookies, Response];
