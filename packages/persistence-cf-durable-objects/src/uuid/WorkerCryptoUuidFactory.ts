import { ValidatedUuidFactory } from "@eos/infrastructure/uuid/validated-uuid-factory";

export class WorkerCryptoUuidFactory extends ValidatedUuidFactory {
	private static _instance: WorkerCryptoUuidFactory;
	static instance(): WorkerCryptoUuidFactory {
		return (WorkerCryptoUuidFactory._instance ??=
			new WorkerCryptoUuidFactory());
	}

	random(): string {
		return crypto.randomUUID();
	}
}
