import type { UuidFactory } from "@eos/domain/common/uuid";
import { assert } from "@eos/domain/invariance";

export abstract class ValidatedUuidFactory implements UuidFactory {
	private static readonly REGEX =
		/^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

	public abstract random(): string;

	public tryFrom(maybeUuid: string): string {
		assert(
			ValidatedUuidFactory.REGEX.test(maybeUuid),
			`Invalid value passed for Uuid: ${maybeUuid}`,
		);

		return maybeUuid;
	}
}
