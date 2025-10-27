import type AlwaysOnTopPlugin from '../../main';
import { CustomPopoutCommand, PopoutCommandType } from 'src/setting/settings';
import { Notice } from 'obsidian';
import type { PopoutManager } from '../popout/popout-manager';

export function registerCustomPopoutCommands(plugin: AlwaysOnTopPlugin, popouts: PopoutManager){
    const customCommands = plugin.settings.customPopoutCommands;
    customCommands.forEach(customCommand => {
        registerCustomPopoutCommand(plugin, popouts, customCommand);
    });

    plugin.registerObsidianProtocolHandler('custom-popout', async (params) => {
        console.log('custom-popout', params);
        const { vault, id } = params;

        if(vault !== plugin.app.vault.getName() || !id){
            return;
        }
        
        const customCommand = plugin.settings.customPopoutCommands.find(cmd => cmd.id === id);
        
        if(customCommand){
            plugin.popouts.openPopout(true, customCommand);
        }
    })
}

export function registerCustomPopoutCommand(plugin: AlwaysOnTopPlugin, popouts: PopoutManager, customCommand: CustomPopoutCommand){
    plugin.addCommand({
        id: customCommand.id,
        name: customCommand.name,
        callback: () => {
            popouts.openPopout(true, customCommand);
        }
    })
}

export function removeCustomPopoutCommand(plugin: AlwaysOnTopPlugin, customCommand: CustomPopoutCommand){
    plugin.removeCommand(customCommand.id);
}