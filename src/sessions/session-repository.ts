import { UserAuthenticationState } from "../oauth/types";

export interface SessionRepository {
	findById(id: string): Promise<UserAuthenticationState | null>;
	upsert(id: string, session: UserAuthenticationState): Promise<void>;
	delete(id: string): Promise<void>;
}
