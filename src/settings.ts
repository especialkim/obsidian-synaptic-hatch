import { Plugin } from 'obsidian';

export interface AlwaysOnTopSettings {
	showIndicatorInMainWindow: boolean;
	showIndicatorInPopoutWindows: boolean;
	mainIndicatorOffsetTop: number;
	mainIndicatorOffsetRight: number;
	popoutIndicatorOffsetTop: number;
	popoutIndicatorOffsetRight: number;
	mainIndicatorSize: number;
	mainIndicatorIconSize: number;
	popoutIndicatorSize: number;
	popoutIndicatorIconSize: number;
}

export const DEFAULT_SETTINGS: AlwaysOnTopSettings = {
	showIndicatorInMainWindow: false,
	showIndicatorInPopoutWindows: true,
	mainIndicatorOffsetTop: 80,
	mainIndicatorOffsetRight: 12,
	popoutIndicatorOffsetTop: 80,
	popoutIndicatorOffsetRight: 12,
	mainIndicatorSize: 30,
	mainIndicatorIconSize: 15,
	popoutIndicatorSize: 30,
	popoutIndicatorIconSize: 15,
};

export async function loadPluginSettings(plugin: Plugin): Promise<AlwaysOnTopSettings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function savePluginSettings(plugin: Plugin, settings: AlwaysOnTopSettings): Promise<void> {
	await plugin.saveData(settings);
}
