import { Notice } from 'obsidian';
import type AlwaysOnTopPlugin from '../../main';
import type { PopoutManager } from '../popout/popout-manager';
import type { CustomPopoutCommand } from '../settings';

export function registerOpenAlwaysOnTopPopoutCommand(plugin: AlwaysOnTopPlugin, popouts: PopoutManager) {
	// 일반 커맨드 - 현재 포커스 상태 유지
	// plugin.addCommand({
	// 	id: 'open-always-on-top-popout',
	// 	name: 'Open Always-On-Top Popout',
	// 	callback: () => {
	// 		popouts.openPopout(false);
	// 	},
	// });

	// 퀵노트 커맨드 - 항상 메인창을 뒤로 보내기
	// plugin.addCommand({
	// 	id: 'open-always-on-top-popout-background',
	// 	name: 'Open Always-On-Top Popout For Quick Note',
	// 	callback: () => {
	// 		popouts.openPopout(true);
	// 	},
	// });

	// Protocol handler - 퀵노트 용도로 항상 뒤로 보내기
	// plugin.registerObsidianProtocolHandler('aot-popup', async (params) => {
	// 	console.log(params);
	// 	await popouts.openPopout(true);
	// });

	// plugin.registerObsidianProtocolHandler('custom-command', async (params) => {
	// 	if(!params.vault) {
	// 		new Notice('Vault is required');
	// 		return;
	// 	}

	// 	if(params.vault !== plugin.app.vault.getName()) {
	// 		return;
	// 	}

	// 	const id = params.id;
	// 	const cmd = getMatchedCustomCommand(plugin, id);
	// 	if(cmd){
	// 		popouts.openPopout(true, cmd);
	// 	}else{
	// 		new Notice(`Custom command ${id} not found`);
	// 	}
	// });
}

// function getMatchedCustomCommand(plugin: AlwaysOnTopPlugin, id: string): CustomPopoutCommand | undefined {
// 	const customCommands = plugin.settings.customPopoutCommands;
// 	const cmd = customCommands.find(command => command.id === id);
// 	return cmd || undefined;
// }
