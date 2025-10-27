import type AlwaysOnTopPlugin from '../../main';
import { CustomPopoutCommand, PopoutCommandType } from 'src/settings';
import { Notice } from 'obsidian';
import type { PopoutManager } from '../popout/popout-manager';

export function registerCustomPopoutCommands(plugin: AlwaysOnTopPlugin, popouts: PopoutManager){
    const customCommands = plugin.settings.customPopoutCommands;
    customCommands.forEach(customCommand => {
        registerCustomPopoutCommand(plugin, popouts, customCommand);
    });
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

