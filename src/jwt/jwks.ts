import { verify } from ".";
import { assert } from "../util/assert";

interface JwksBody {
	keys: JwksKey[];
}

interface JwksKey {
	kty: 'RSA';
	use: 'sig';
	n: string;
	e: string;
	kid: string;
	x5t: string;
	x5c: string[];
	alg: 'RS256' | 'RS384' | 'PS256';
}

/**
 * @example
 */
export class Jwks {
	private readonly keys: JwksKey[];

	static async fromJwksUri(jwksUri: string): Promise<Jwks> {
		const body = await fetch(jwksUri).then((res) => res.json());

		JwksValidator.assertJwks(body);

		return new Jwks(body);
	}

	constructor({ keys }: JwksBody) {
		this.keys = keys;
	}

	getKeys(): JwksKey[] {
		return this.keys;
	}

	getKey(kid: string): JwksKey | undefined {
		return this.keys.find((key) => key.kid === kid);
	}

	validate(accessToken: string): void {
		for (const key of this.keys) {
			verify
		}
	}
}

class JwksValidator {
	private static readonly VALID_ALGORITHMS = Object.freeze(new Set(['RS256', 'RS384', 'PS256']));

	public static assertJwks(body: unknown): asserts body is JwksBody {
		assert(JwksValidator.validateBody(body), 'Invalid JWKS body');
	}

	private static validateBody(body: unknown): body is JwksBody {
		return (
			typeof body === 'object' &&
			body !== null &&
			Array.isArray((body as any).keys) &&
			(body as any).keys.every(JwksValidator.validateKey)
		);
	}

	private static validateKey(key: unknown): key is JwksKey {
		return typeof key === 'object' && key !== null && typeof (key as any).kid === 'string' && JwksValidator.VALID_ALGORITHMS.has((key as any).alg);
	}
}
