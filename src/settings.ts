import { Plugin } from 'obsidian';

export type PopoutCommandType = 'blank' | 'file' | 'folder' | 'journal';
export type JournalPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface CustomPopoutCommand {
	id: string;
	name: string;
	type: PopoutCommandType;
	enabled: boolean;
	config: {
		filePath?: string;
		folderPath?: string;
		fileNameRule?: string;
		useTemplate?: boolean;
		templatePath?: string;
		journalPeriod?: JournalPeriod;
	};
}

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
	useCustomPopoutCommands: boolean;
	customPopoutCommands: CustomPopoutCommand[];
	dateFormat: string;
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
	useCustomPopoutCommands: false,
	customPopoutCommands: [],
	dateFormat: 'YYYY-MM-DD',
};

export async function loadPluginSettings(plugin: Plugin): Promise<AlwaysOnTopSettings> {
	return Object.assign({}, DEFAULT_SETTINGS, await plugin.loadData());
}

export async function savePluginSettings(plugin: Plugin, settings: AlwaysOnTopSettings): Promise<void> {
	await plugin.saveData(settings);
}
