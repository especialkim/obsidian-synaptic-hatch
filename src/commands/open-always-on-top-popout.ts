import type AlwaysOnTopPlugin from '../../main';
import type { PopoutManager } from '../popout/popout-manager';

export function registerOpenAlwaysOnTopPopoutCommand(plugin: AlwaysOnTopPlugin, popouts: PopoutManager) {
	// 일반 커맨드 - 현재 포커스 상태 유지
	plugin.addCommand({
		id: 'open-always-on-top-popout',
		name: 'Open Always-On-Top Popout',
		callback: () => {
			popouts.openPopout(false);
		},
	});
}