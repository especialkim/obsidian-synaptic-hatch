import type AlwaysOnTopPlugin from '../../main';
import type { IndicatorManager } from '../indicator-manager';
import type { PopoutManager } from '../popout/popout-manager';
import { registerToggleWindowPinCommand } from './toggle-window-pin';
import { registerOpenAlwaysOnTopPopoutCommand } from './open-always-on-top-popout';

interface RegisterCommandOptions {
	indicators: IndicatorManager;
	popouts: PopoutManager;
}

export function registerCommands(plugin: AlwaysOnTopPlugin, options: RegisterCommandOptions) {
	registerToggleWindowPinCommand(plugin, options.indicators);
	registerOpenAlwaysOnTopPopoutCommand(plugin, options.popouts);
}
