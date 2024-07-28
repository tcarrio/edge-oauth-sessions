export class ResponseCookies {
	constructor(private readonly map: Map<string, SetCookieObject>) {}

	static fromHeaders(headers: Headers): ResponseCookies {
		return new ResponseCookies(
			headers.getAll("set-cookie").reduce((map, entry) => {
				const [name, rest] = entry.split("=", 2);
				const [value, ...props] = rest.split("; ");
				const pairs = props.map((p) => p.split("=", 2));

				const cookie: SetCookieObject = {
					name,
					value,
					metadata: pairs.reduce(
						(obj, [key, value = null]) => ({ ...obj, [key]: value }),
						{},
					),
				};

				map.set(cookie.name, cookie);

				return map;
			}, new Map<string, SetCookieObject>()),
		);
	}

	has(key: string): boolean {
		return this.map.has(key);
	}

	get(key: string): SetCookieObject | null {
		return this.map.get(key) ?? null;
	}

	keys(): string[] {
		return [...this.map.keys()];
	}
}

export interface SetCookieObject {
	name: string;
	value: string;
	metadata: Record<string, string>;
}
