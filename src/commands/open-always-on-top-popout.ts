import type AlwaysOnTopPlugin from '../../main';
import type { PopoutManager } from '../popout/popout-manager';
import { i18n } from '../utils/i18n';

export function registerOpenAlwaysOnTopPopoutCommand(plugin: AlwaysOnTopPlugin, popouts: PopoutManager) {
	// 현재 탭을 새 Always-On-Top 창으로 엶
	plugin.addCommand({
		id: 'open-always-on-top-popout',
		name: i18n.t('command.openAlwaysOnTopPopout'),
		callback: () => {
			void popouts.openPopout(false);
		},
	});

	// 메인 창을 뒤로 보내며 새 Always-On-Top 창으로 엶
	plugin.addCommand({
		id: 'open-always-on-top-popout-background',
		name: i18n.t('command.openAlwaysOnTopPopoutExclusive'),
		callback: () => {
			void popouts.openPopout(true);
		},
	});
}