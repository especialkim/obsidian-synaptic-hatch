import { Notice } from 'obsidian';
import { toggleAlwaysOnTop, AlwaysOnTopResult } from '../electron';
import type { IndicatorManager } from '../indicator-manager';
import type AlwaysOnTopPlugin from '../../main';

function showToggleNotice(result: AlwaysOnTopResult) {
	switch (result) {
		case 'applied':
			new Notice('Window pinned on top');
			break;
		case 'removed':
			new Notice('Window unpinned');
			break;
		case 'unavailable':
		default:
			new Notice('Unable to control the window');
	}
}

export function executeToggleWindowPin(indicators: IndicatorManager) {
	const result = toggleAlwaysOnTop();
	showToggleNotice(result);

	const focusedDoc = indicators.getFocusedDocument();
	if (focusedDoc) {
		const isPinned = result === 'applied' || result === 'already';
		indicators.setWindowPinned(focusedDoc, isPinned);
	}

	indicators.updateAllIndicators();
}

export function registerToggleWindowPinCommand(plugin: AlwaysOnTopPlugin, indicators: IndicatorManager) {
	plugin.addCommand({
		id: 'toggle-window-pin',
		name: 'Toggle Window Pin for Always on Top',
		callback: () => executeToggleWindowPin(indicators),
	});
}
