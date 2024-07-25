import { z } from 'zod';
import { AuthorizationUrlOptions, AuthorizationUrlOptionsSchema } from './client';

export const BaseOIDCOptionsSchema = z.object({
	clientId: z.string().min(1),
	clientSecret: z.string().min(1),
	issuerUrl: z.string().url(),
	authorization: AuthorizationUrlOptionsSchema.partial(),
});

export type BaseOIDCOptions = z.infer<typeof BaseOIDCOptionsSchema> & {
	clientId: string;
	clientSecret: string;
	issuerUrl: string;
	authorization: Partial<AuthorizationUrlOptions>;
};

export type EnumConstType<T> = T[keyof T];

export function enumValues<T extends object>(obj: T): [EnumConstType<T>, ...EnumConstType<T>[]] {
	return Object.values(obj) as [EnumConstType<T>, ...EnumConstType<T>[]];
}
