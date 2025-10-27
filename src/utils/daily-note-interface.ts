import type { App } from 'obsidian';
import type { JournalPeriod } from '../settings';

interface PeriodicNotesSettings {
	daily?: {
		enabled?: boolean;
		format?: string;
		folder?: string;
	};
	weekly?: {
		enabled?: boolean;
		format?: string;
		folder?: string;
	};
	monthly?: {
		enabled?: boolean;
		format?: string;
		folder?: string;
	};
	quarterly?: {
		enabled?: boolean;
		format?: string;
		folder?: string;
	};
	yearly?: {
		enabled?: boolean;
		format?: string;
		folder?: string;
	};
}

/**
 * Daily Note Interface를 감지하여 사용 가능한 저널 주기를 반환
 */
export function getAvailableJournalPeriods(app: App): JournalPeriod[] {
	const availablePeriods: JournalPeriod[] = [];

	// Daily Notes (Core Plugin)
	const dailyNotesPlugin = (app as any).internalPlugins?.plugins?.['daily-notes'];
	if (dailyNotesPlugin && dailyNotesPlugin.enabled) {
		availablePeriods.push('daily');
	}

	// Periodic Notes Plugin
	const periodicNotesPlugin = (app as any).plugins?.plugins?.['periodic-notes'];
	if (periodicNotesPlugin && periodicNotesPlugin.settings) {
		const settings = periodicNotesPlugin.settings as PeriodicNotesSettings;

		if (settings.daily?.enabled) {
			if (!availablePeriods.includes('daily')) {
				availablePeriods.push('daily');
			}
		}
		if (settings.weekly?.enabled) {
			availablePeriods.push('weekly');
		}
		if (settings.monthly?.enabled) {
			availablePeriods.push('monthly');
		}
		if (settings.quarterly?.enabled) {
			availablePeriods.push('quarterly');
		}
		if (settings.yearly?.enabled) {
			availablePeriods.push('yearly');
		}
	}

	// Calendar Plugin (일일 노트만 지원)
	const calendarPlugin = (app as any).plugins?.plugins?.['calendar'];
	if (calendarPlugin && !availablePeriods.includes('daily')) {
		availablePeriods.push('daily');
	}

	return availablePeriods;
}

/**
 * 저널 주기가 하나라도 설정되어 있는지 확인
 */
export function hasAnyJournalPeriod(app: App): boolean {
	return getAvailableJournalPeriods(app).length > 0;
}

