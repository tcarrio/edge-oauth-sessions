import { z } from 'zod';

export const OAuthCodeExchangeResponseSchema = z.object({
	access_token: z.string(),
	id_token: z.string().optional(),
	refresh_token: z.string(),
});
