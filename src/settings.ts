import { Plugin } from 'obsidian';

export interface AlwaysOnTopSettings {
	showIndicatorInMainWindow: boolean;
	showIndicatorInPopoutWindows: boolean;
	mainIndicatorOffsetTop: number;
	mainIndicatorOffsetRight: number;
	popoutIndicatorOffsetTop: number;
	popoutIndicatorOffsetRight: number;
}

export const DEFAULT_SETTINGS: AlwaysOnTopSettings = {
	showIndicatorInMainWindow: false,
	showIndicatorInPopoutWindows: true,
	mainIndicatorOffsetTop: 60,
	mainIndicatorOffsetRight: 12,
	popoutIndicatorOffsetTop: 16,
	popoutIndicatorOffsetRight: 12,
};

export async function loadPluginSettings(plugin: Plugin): Promise<AlwaysOnTopSettings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function savePluginSettings(plugin: Plugin, settings: AlwaysOnTopSettings): Promise<void> {
	await plugin.saveData(settings);
}
