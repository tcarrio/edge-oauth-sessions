import type { Clock } from '@eos/domain/common/clock';

export class DateClockService implements Clock {
	now(): number {
		return this.currentDate().getTime();
	}

	currentDate(): Date {
		return new Date();
	}
}
