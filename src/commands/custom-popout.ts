import type AlwaysOnTopPlugin from '../../main';
import { CustomPopoutCommand } from 'src/setting/settings';
import type { PopoutManager } from '../popout/popout-manager';

export function registerCustomPopoutCommands(plugin: AlwaysOnTopPlugin, popouts: PopoutManager){

    if(!plugin.settings.useCustomPopoutCommands){
        return;
    }

    const customCommands = plugin.settings.customPopoutCommands;
    customCommands.forEach(customCommand => {
        registerCustomPopoutCommand(plugin, popouts, customCommand);
    });

    plugin.registerObsidianProtocolHandler('custom-popout', (params) => {
        const { vault, id } = params;

        if(vault !== plugin.app.vault.getName() || !id){
            return;
        }
        
        const customCommand = plugin.settings.customPopoutCommands.find(cmd => cmd.id === id);
        
        if(customCommand){
            void plugin.popouts.openPopout(true, customCommand);
        }
    })
}

export function registerCustomPopoutCommand(plugin: AlwaysOnTopPlugin, popouts: PopoutManager, customCommand: CustomPopoutCommand){
    if(!customCommand.enabled){
        return;
    }
    
    plugin.addCommand({
        id: customCommand.id,
        name: customCommand.name,
        callback: () => {
            void popouts.openPopout(true, customCommand);
        }
    })
}

export function removeCustomPopoutCommand(plugin: AlwaysOnTopPlugin, customCommand: CustomPopoutCommand){
    const commandId = `${plugin.manifest.id}:${customCommand.id}`;
    const commands = (plugin.app as { commands?: { removeCommand: (id: string) => void } }).commands;
    commands?.removeCommand(commandId);
}
