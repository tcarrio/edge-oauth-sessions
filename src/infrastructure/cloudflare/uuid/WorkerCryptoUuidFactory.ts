import type { UuidFactory } from "@eos/domain/common/uuid";
import { UuidFactoryImpl } from "@eos/infrastructure/uuid/uuid-factory-impl";

export class WorkerCryptoUuidFactory
	extends UuidFactoryImpl
	implements UuidFactory
{
	private static _instance: WorkerCryptoUuidFactory;
	static instance(): WorkerCryptoUuidFactory {
		return (WorkerCryptoUuidFactory._instance ??=
			new WorkerCryptoUuidFactory());
	}

	random(): string {
		return crypto.randomUUID();
	}
}
