import type { AuthSessionManager as IAuthSessionManager } from "@eos/domain/sessions/auth-session-manager";
import type { ISessionState } from "@eos/domain/sessions/session-state";
import { AuthSessionManager } from "@eos/infrastructure/common/auth-session-manager";
import { DateClockService } from "@eos/infrastructure/common/date-clock-service";
import { OpenIDConnectClientFactory } from "@eos/infrastructure/open-id-connect/factory";
import { DurableObjectStateSessionRepository } from "@eos/infrastructure/persistence/durable-objects/session-repository";
import { DurableObject } from "cloudflare:workers";
import type { Env } from "../@types/env";

/** A Durable Object's behavior is defined in an exported Javascript class */
export class DurableAuthSessionObject
	extends DurableObject<Env>
	implements IAuthSessionManager
{
	private delegatedAuthSessionManager: IAuthSessionManager;

	/**
	 * The constructor is invoked once upon creation of the Durable Object, i.e. the first call to
	 * 	`DurableObjectStub::get` for a given identifier (no-op constructors can be omitted)
	 *
	 * @param ctx - The interface for interacting with Durable Object state
	 * @param env - The interface to reference bindings declared in wrangler.toml
	 */
	constructor(
		ctx: DurableObjectState,
		env: Env,
		private immutable = true,
	) {
		super(ctx, env);

		const sessionRepository = new DurableObjectStateSessionRepository(ctx);
		const openIDConnectClient =
			OpenIDConnectClientFactory.withFetchClient().forEnv(env);
		const clock = new DateClockService();

		this.delegatedAuthSessionManager = new AuthSessionManager(
			sessionRepository,
			openIDConnectClient,
			clock,
		);
	}

	/**
	 * To support testing scenarios, we need to override the ASM to validate with mocks
	 *
	 * This method is disabled during implicit construction via Cloudflare Workers by the
	 * `immutable` property
	 *
	 * @param {AuthSessionManager} authSessionManager
	 */
	public setAuthSessionManager(authSessionManager: AuthSessionManager): void {
		if (!this.immutable) this.delegatedAuthSessionManager = authSessionManager;
	}

	async authenticate(sessionId: string): Promise<ISessionState | void> {
		return this.delegatedAuthSessionManager.authenticate(sessionId);
	}

	async logout(sessionId: string): Promise<void> {
		return this.delegatedAuthSessionManager.logout(sessionId);
	}
}
