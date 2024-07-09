import { SessionState } from "./session-state";

export interface SessionRepository {
	findById(id: string): Promise<SessionState | null>;
	upsert(id: string, session: SessionState): Promise<void>;
	delete(id: string): Promise<void>;
}
