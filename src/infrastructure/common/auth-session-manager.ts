import type { Clock } from '@eos/domain/common/clock';
import { time } from '@eos/domain/common/time';
import type { OpenIDConnectClient } from '@eos/domain/open-id-connect/client';
import type { AuthSessionManager as IAuthSessionManager } from '@eos/domain/sessions/auth-session-manager';
import type { SessionRepository } from '@eos/domain/sessions/session-repository';
import { HydratingSessionState, type ISessionState } from '@eos/domain/sessions/session-state';
import type { JWTPayload } from 'jose';

export class AuthSessionManager implements IAuthSessionManager {
	protected expirationBuffer: number = 60 * time.Second;

	constructor(
		private readonly sessionRepository: SessionRepository,
		private readonly openIDConnectClient: OpenIDConnectClient,
		private readonly clock: Clock,
	) {}

	async authenticate(sessionId: string): Promise<ISessionState | null> {
		const rawCredentials = await this.sessionRepository.findById(sessionId);

		if (!rawCredentials) {
			return null;
		}

		const credentials = new HydratingSessionState(rawCredentials);

		const { accessToken, refreshToken } = credentials.parsed;

		if (this.needsRefresh(accessToken)) {
			const newRawCredentials = await this.openIDConnectClient.refresh({
				refresh_token: refreshToken,
			});

			await this.sessionRepository.upsert(sessionId, newRawCredentials);

			return newRawCredentials;
		}

		return credentials.raw;
	}

	async logout(sessionId: string): Promise<void> {
		this.sessionRepository.delete(sessionId);
	}

	private needsRefresh(accessToken: JWTPayload): boolean {
		const expirationDate = typeof accessToken.exp !== 'number' || !accessToken?.exp ? 0 : accessToken.exp;

		return this.clock.now() - this.expirationBuffer > expirationDate * time.Second;
	}
}
