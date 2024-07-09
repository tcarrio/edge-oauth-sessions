import { decodeJwt } from "jose";
import { SessionState } from "./session-state";

export type RawSessionCredentials = SessionState;

export interface ParsedSessionCredentials<AccessTokenHeader = {}, AccessTokenPayload = {}> {
	accessToken: JwtData<AccessTokenHeader, AccessTokenPayload>;
	refreshToken: string;
	idToken?: string;
}

export interface ISessionCredentials {
	raw: RawSessionCredentials;
	parsed(): ParsedSessionCredentials;
}

export class SessionCredentials<AccessTokenHeader = {}, AccessTokenPayload = {}> implements ISessionCredentials {
	private __cachedParsed: ParsedSessionCredentials | null = null;

	constructor(public readonly raw: RawSessionCredentials) {}

	parsed(): ParsedSessionCredentials {
		return this.__cachedParsed ??= {
			idToken: this.raw.idToken,
			accessToken: decodeJwt(this.raw.accessToken),
			refreshToken: this.raw.refreshToken,
		};
	}
}


/**
 * @typedef JwtAlgorithm
 * @type {"ES256" | "ES384" | "ES512" | "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512"}
 */
export type JwtAlgorithm = "ES256" | "ES384" | "ES512" | "HS256" | "HS384" | "HS512" | "RS256" | "RS384" | "RS512"

/**
 * @typedef JwtAlgorithms
 */
export type JwtAlgorithms = {
    [key: string]: SubtleCryptoImportKeyAlgorithm
}

/**
 * @typedef JwtHeader
 * @prop {string} [typ] Type
 */
export type JwtHeader<T = {}> = {
    /**
     * Type (default: `"JWT"`)
     *
     * @default "JWT"
     */
    typ?: string

    /**
     * Algorithm (default: `"HS256"`)
     *
     * @default "HS256"
     */
    alg?: JwtAlgorithm
} & T

/**
 * @typedef JwtPayload
 * @prop {string} [iss] Issuer
 * @prop {string} [sub] Subject
 * @prop {string | string[]} [aud] Audience
 * @prop {string} [exp] Expiration Time
 * @prop {string} [nbf] Not Before
 * @prop {string} [iat] Issued At
 * @prop {string} [jti] JWT ID
 */
export type JwtPayload<T = { [key: string]: any }> = {
    /** Issuer */
    iss?: string

    /** Subject */
    sub?: string

    /** Audience */
    aud?: string | string[]

    /** Expiration Time */
    exp?: number

    /** Not Before */
    nbf?: number

    /** Issued At */
    iat?: number

    /** JWT ID */
    jti?: string
} & T

/**
 * @typedef JwtData
 * @prop {JwtHeader} header
 * @prop {JwtPayload} payload
 */
export type JwtData<Payload = {}, Header = {}> = {
    header?: JwtHeader<Header>
    payload?: JwtPayload<Payload>
}
