import { RawSessionCredentials } from '../sessions/session-credentials';

interface RefreshResponseBody {
	access_token: string;
	id_token: string;
}

export class OAuthTokenRefresher {
	public constructor(
		private readonly clientId: string,
		private readonly clientSecret: string,
		private readonly authorizationUrl: string,

	) {}

	public async refreshTokenWithRetries(refreshToken: string): Promise<RawSessionCredentials> {
		const maxRetries = this.maxRetries;
		let retries = 0;

		while (retries < maxRetries) {
			try {
				return await this.refreshToken(refreshToken);
			} catch (e) {
				retries++;
			}
		}

		throw new Error('Failed to refresh token');
	}

	private async refreshToken(refreshToken: string): Promise<RawSessionCredentials> {
		const requestOptions = {
			method: 'POST',
			headers: { 'content-type': 'application/x-www-form-urlencoded' },
			data: new URLSearchParams({
				grant_type: 'refresh_token',
				client_id: this.clientId,
				client_secret: this.clientSecret,
				refresh_token: refreshToken,
			}),
		};

		const res = await fetch(this.refreshUri, requestOptions);

		if (!res.ok) {
			throw new Error(`Failed to refresh token: ${res.status} ${res.statusText}`);
		}

		const { access_token, id_token } = await res.json<RefreshResponseBody>();

		return { idToken: id_token, accessToken: access_token, refreshToken: refreshToken };
	}
}
