import { RequestWithCookies } from "../@types/request";
import { Middleware } from './middleware';

export class NoOpMiddleware extends Middleware {
	async handle(_request: RequestWithCookies): Promise<void> {}
}
