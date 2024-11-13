import type { UuidFactory } from '@eos/domain/common/uuid';
import { assert } from '@eos/domain/invariance';

export class UuidFactoryImpl implements UuidFactory {
	private static readonly REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

	public random(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	public tryFrom(maybeUuid: string): string {
		assert(UuidFactoryImpl.REGEX.test(maybeUuid), `Invalid value passed for Uuid: ${maybeUuid}`);

		return maybeUuid;
	}
}
