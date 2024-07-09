import { assert } from '../invariance';

export class UuidFactory {
	private static readonly REGEX = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

	public static random(): string {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (Math.random() * 16) | 0;
			const v = c === 'x' ? r : (r & 0x3) | 0x8;
			return v.toString(16);
		});
	}

	protected from(maybeUuid: string) {
		assert(UuidFactory.REGEX.test(maybeUuid), 'Invalid value passed for Uuid: ' + maybeUuid);
	}
}
