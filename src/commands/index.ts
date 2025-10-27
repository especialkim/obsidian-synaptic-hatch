import type AlwaysOnTopPlugin from '../../main';
import type { IndicatorManager } from '../indicator-manager';
import type { PopoutManager } from '../popout/popout-manager';
import { registerToggleWindowPinCommand } from './toggle-window-pin';
import { registerOpenAlwaysOnTopPopoutCommand } from './open-always-on-top-popout';
import { CustomPopoutCommand } from 'src/settings';
import { Notice } from 'obsidian';
import { registerCustomPopoutCommands, registerCustomPopoutCommand, removeCustomPopoutCommand } from './custom-popout';

interface RegisterCommandOptions {
	indicators: IndicatorManager;
	popouts: PopoutManager;
}

export function registerCommands(plugin: AlwaysOnTopPlugin, options: RegisterCommandOptions) {
	registerToggleWindowPinCommand(plugin, options.indicators);
	registerOpenAlwaysOnTopPopoutCommand(plugin, options.popouts);
	registerCustomPopoutCommands(plugin, options.popouts);
}

export function registerCustomCommand(plugin: AlwaysOnTopPlugin, customCommand: CustomPopoutCommand, popouts: PopoutManager) {
	registerCustomPopoutCommand(plugin, popouts, customCommand);
}

export function removeCustomCommand(plugin: AlwaysOnTopPlugin, customCommand: CustomPopoutCommand) {
	new Notice(`Custom command ${customCommand.id} removed`);
}

