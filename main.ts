import { Plugin, WorkspaceWindow } from 'obsidian';
import { IndicatorManager } from './src/indicator-manager';
import { PopoutManager } from './src/popout/popout-manager';
import { registerCommands } from './src/commands';
import { AlwaysOnTopSettingTab } from './src/settings-tab';
import { AlwaysOnTopSettings, loadPluginSettings, savePluginSettings } from './src/settings';
import { executeToggleWindowPin } from './src/commands/toggle-window-pin';

export default class AlwaysOnTopPlugin extends Plugin {
	settings: AlwaysOnTopSettings;
	private indicators!: IndicatorManager;
	private popouts!: PopoutManager;

	async onload() {
		this.settings = await loadPluginSettings(this);

		this.indicators = new IndicatorManager(this, () => executeToggleWindowPin(this.indicators));
		this.popouts = new PopoutManager(this, this.indicators);

		this.indicators.init();

		registerCommands(this, {
			indicators: this.indicators,
			popouts: this.popouts,
		});

		this.addSettingTab(new AlwaysOnTopSettingTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on('window-open', (win: WorkspaceWindow) => {
				this.indicators.handleWindowOpened(win.doc);
				this.popouts.handleWindowOpened(win.doc);
			}),
		);

		this.registerEvent(
			this.app.workspace.on('window-close', (win: WorkspaceWindow) => {
				this.indicators.handleWindowClosed(win.doc);
				this.popouts.handleWindowClosed(win.doc);
			}),
		);
	}

	onunload() {
		this.indicators?.dispose();
		this.popouts?.dispose();
	}

	async persistSettings() {
		await savePluginSettings(this, this.settings);
		this.indicators.refreshIndicators();
	}
}
