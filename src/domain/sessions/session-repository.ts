import { ISessionState } from './session-state';

export interface SessionRepository {
	findById(id: string): Promise<ISessionState | null>;
	upsert(id: string, session: ISessionState): Promise<void>;
	delete(id: string): Promise<void>;
	prepare(): Promise<void>;
}
