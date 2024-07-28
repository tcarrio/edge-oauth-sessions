import { z } from "zod";
import {
	type AuthorizationUrlOptions,
	AuthorizationUrlOptionsSchema,
} from "./client";

export const BaseOIDCOptionsSchema = z.object({
	clientId: z.string().min(1),
	clientSecret: z.string().min(1),
	issuerUrl: z.string().url(),
	authorization: AuthorizationUrlOptionsSchema.partial().default({}),
});

export type BaseOIDCOptions = z.infer<typeof BaseOIDCOptionsSchema> & {
	clientId: string;
	clientSecret: string;
	issuerUrl: string;
	authorization: Partial<AuthorizationUrlOptions>;
};

export const EnvBaseOIDCOptionsSchema = z.object({
	OAUTH_CLIENT_ID: z.string().min(1),
	OAUTH_CLIENT_SECRET: z.string().min(1),
	OAUTH_ISSUER_URL: z.string().url(),
	OAUTH_AUTHORIZATION: z.string(),
});

export type EnumConstType<T> = T[keyof T];

export function enumValues<T extends object>(
	obj: T,
): [EnumConstType<T>, ...EnumConstType<T>[]] {
	return Object.values(obj) as [EnumConstType<T>, ...EnumConstType<T>[]];
}
