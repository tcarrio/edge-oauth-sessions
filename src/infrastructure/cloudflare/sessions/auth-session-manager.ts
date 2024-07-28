import type {
	AuthSessionManager,
	AuthSessionManagerFactory,
} from "@eos/domain/sessions/auth-session-manager";
import type { Env } from "../@types/env";

export class AuthSessionManagerFactoryFactory {
	static forEnv(env: Env): AuthSessionManagerFactory {
		return {
			forId: (id: string) => {
				const durableObjectId = env.DURABLE_AUTH_SESSION_OBJECT.idFromName(id);

				return env.DURABLE_AUTH_SESSION_OBJECT.get(
					durableObjectId,
				);
			},
		};
	}
}