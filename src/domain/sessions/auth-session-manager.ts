import type { ISessionState } from './session-state';

export interface AuthSessionManager {
	authenticate(sessionId: string): Promise<ISessionState | null>;
	logout(sessionId: string): Promise<void>;
}

export interface AuthSessionManagerFactory {
	forId(id: string): AuthSessionManager;
}
