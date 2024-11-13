import { type Context, HonoRequest } from 'hono';

export type WithCookies<Ctx extends Context = Context> = Ctx & {
	var: {
		cookies: Record<string, string | undefined>;
	};
};
