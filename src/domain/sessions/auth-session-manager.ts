import { RawSessionCredentials } from './session-credentials';

export interface AuthSessionManager {
	authenticate(sessionId: string): Promise<RawSessionCredentials | undefined>;
	logout(sessionId: string): Promise<void>;
}

export interface AuthSessionManagerFactory {
	forId(id: string): AuthSessionManager;
}
