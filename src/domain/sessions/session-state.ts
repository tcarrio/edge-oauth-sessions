import { decodeJwt, type JWTPayload } from "jose";

export interface ISessionState {
	readonly accessToken: string;
	readonly refreshToken: string;
	readonly idToken?: string;
}

export interface IEnrichedSessionState<AccessTokenPayload, IdTokenPayload> {
	readonly accessToken: JWTPayload & AccessTokenPayload;
	readonly refreshToken: string;
	readonly idToken?: JWTPayload & IdTokenPayload;
}

export class HydratingSessionState<
	AccessTokenPayload extends object = object,
	IdTokenPayload extends object = object,
> {
	private _parsed: IEnrichedSessionState<
		AccessTokenPayload,
		IdTokenPayload
	> | null = null;

	public constructor(public readonly raw: ISessionState) {}

	public get parsed(): IEnrichedSessionState<
		AccessTokenPayload,
		IdTokenPayload
	> {
		return (this._parsed ??= this.hydrate());
	}

	private hydrate(): IEnrichedSessionState<AccessTokenPayload, IdTokenPayload> {
		return {
			accessToken: decodeJwt(this.raw.accessToken),
			refreshToken: this.raw.refreshToken,
			idToken: this.raw.idToken ? decodeJwt(this.raw.idToken) : undefined,
		};
	}
}
