import { WithCookies } from '../@types/request';

const CHALLENGE_HEADER = 'cf-challenge';
const CHALLENGE_VALUE = 'captcha';

export function challengeWithCaptcha(): Response {
	return new Response(null, {
		status: 403,
		headers: {
			[CHALLENGE_HEADER]: CHALLENGE_VALUE,
		},
	});
}

const CAPTCHA_CLEARANCE = 'cf_clearance';

export function hasPassedCaptcha({ cookies }: WithCookies): boolean {
	return Boolean(cookies[CAPTCHA_CLEARANCE]);
}
