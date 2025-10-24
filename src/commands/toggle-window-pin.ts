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

function shouldShowNotice(plugin: AlwaysOnTopPlugin, doc: Document | null): boolean {
	if (!doc) {
		return true; // 문서를 찾을 수 없으면 기본적으로 notice 표시
	}
	
	const isMainWindow = doc === document;
	const hasIndicator = isMainWindow 
		? plugin.settings.showIndicatorInMainWindow 
		: plugin.settings.showIndicatorInPopoutWindows;
	
	// 인디케이터가 보이면 notice 안 보여줌
	return !hasIndicator;
}

export function executeToggleWindowPin(plugin: AlwaysOnTopPlugin, indicators: IndicatorManager) {
	const result = toggleAlwaysOnTop();
	
	const focusedDoc = indicators.getFocusedDocument();
	if (focusedDoc) {
		const isPinned = result === 'applied' || result === 'already';
		indicators.setWindowPinned(focusedDoc, isPinned);
	}

	indicators.updateAllIndicators();
	
	// 인디케이터가 안 보이는 경우에만 notice 표시
	if (shouldShowNotice(plugin, focusedDoc)) {
		showToggleNotice(result);
	} else {
	}
}

export function registerToggleWindowPinCommand(plugin: AlwaysOnTopPlugin, indicators: IndicatorManager) {
	plugin.addCommand({
		id: 'toggle-window-pin',
		name: 'Toggle Window Pin for Always on Top',
		callback: () => executeToggleWindowPin(plugin, indicators),
	});
}
