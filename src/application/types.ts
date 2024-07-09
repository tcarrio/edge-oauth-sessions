import { IRequest } from "itty-router";

export type WithCookies<Req extends IRequest = IRequest> = Req & { cookies: Record<string, string> };
