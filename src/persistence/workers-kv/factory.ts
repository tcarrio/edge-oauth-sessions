import { Env } from "../../@types/env";
import { KVService } from "./service";

export class KVServiceFactory {
	static fromEnv(env: Env) {
		return new KVService(env.KV_AUTH_SESSION);
	}
}
