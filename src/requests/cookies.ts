export type Cookies = Map<string, string>;

export function parseCookie(cookie: string|null): Cookies {
	const cookies = new Map<string, string>();

	if (cookie) {
		cookie.split('; ').forEach((cookie) => {
			const [name, value] = cookie.split('=');
			cookies.set(name.trim(), value.trim());
		});
	}

	return cookies;
}

export function enrichRequestWithCookies(request: Request): RequestWithCookies {
	const cookies = parseCookie(request.headers.get('Cookie'));
	return Object.assign(request, { cookies });
}

export type RequestWithCookies = Request & { cookies: Map<string, string> };

export function cloneRequestWithCookies(request: RequestWithCookies): RequestWithCookies {
	const clonedRequest = new Request(request);

	Object.assign(clonedRequest, { cookies: request.cookies });

	return clonedRequest as RequestWithCookies;
}
