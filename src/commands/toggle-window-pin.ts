import { Notice } from 'obsidian';
import { toggleAlwaysOnTop, AlwaysOnTopResult } from '../electron';
import type { IndicatorManager } from '../indicator-manager';
import type AlwaysOnTopPlugin from '../../main';
import { i18n } from '../utils/i18n';

function showToggleNotice(result: AlwaysOnTopResult) {
	switch (result) {
		case 'applied':
			new Notice(i18n.t('notice.windowPinned'));
			break;
		case 'removed':
			new Notice(i18n.t('notice.windowUnpinned'));
			break;
		case 'unavailable':
		default:
			new Notice(i18n.t('notice.windowControlUnavailable'));
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
	}
}

export function registerToggleWindowPinCommand(plugin: AlwaysOnTopPlugin, indicators: IndicatorManager) {
	plugin.addCommand({
		id: 'toggle-window-pin',
		name: i18n.t('command.toggleWindowPin'),
		callback: () => executeToggleWindowPin(plugin, indicators),
	});
}
