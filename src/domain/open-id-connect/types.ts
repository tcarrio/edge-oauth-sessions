import { AuthorizationUrlOptions } from "./client";

export type BaseOAuthOptions = {
	clientId: string;
	clientSecret: string;
	issuerUrl: string;
	authorization: Partial<AuthorizationUrlOptions>;
}

export type EnumConstType<T> = T[keyof T];
