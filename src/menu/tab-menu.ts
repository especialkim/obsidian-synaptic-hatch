import type AlwaysOnTopPlugin from '../../main';
import type { PopoutManager } from '../popout/popout-manager';
import { i18n } from '../utils/i18n';

/**
 * 탭 메뉴에 Always-On-Top 관련 메뉴 아이템을 등록합니다.
 * '새 창으로 열기' 메뉴 바로 아래에 두 가지 옵션을 추가합니다.
 */
export function registerTabMenuItems(plugin: AlwaysOnTopPlugin, popouts: PopoutManager): void {
	plugin.registerEvent(
		plugin.app.workspace.on('file-menu', (menu, file, source) => {
			// workspace-leaf 메뉴에서만 동작
			if (source !== 'tab-header' && source !== 'more-options') {
				return;
			}
			
			// pane 섹션의 가장 아래에 추가
			menu.addItem((item) => {
				item.setTitle(i18n.t('menu.openInNewPinnedWindow'));
				item.setIcon('pin');
				item.setSection('open');
				item.onClick(() => {
					popouts.openPopout(false);
				});
			});
			
			menu.addItem((item) => {
				item.setTitle(i18n.t('menu.openInNewPinnedWindowExclusive'));
				item.setIcon('pin-off');
				item.setSection('open');
				item.onClick(() => {
					popouts.openPopout(true);
				});
			});
		}),
	);
}

