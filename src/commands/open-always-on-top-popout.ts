import { Notice } from 'obsidian';
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

	// 퀵노트 커맨드 - 항상 메인창을 뒤로 보내기
	plugin.addCommand({
		id: 'open-always-on-top-popout-background',
		name: 'Open Always-On-Top Popout For Quick Note',
		callback: () => {
			popouts.openPopout(true);
		},
	});

	// Protocol handler - 퀵노트 용도로 항상 뒤로 보내기
	plugin.registerObsidianProtocolHandler('aot-popup', async (params) => {
		console.log(params);
		await popouts.openPopout(true);
	});

	plugin.registerObsidianProtocolHandler('synaptic-hatch-custom-command', async (params) => {
		const id = params.id;
		new Notice(`Custom command ${id} Requested`);
	});
}
