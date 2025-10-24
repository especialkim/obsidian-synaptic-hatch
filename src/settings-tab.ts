import { PluginSettingTab, Setting } from 'obsidian';
import type AlwaysOnTopPlugin from '../main';

export class AlwaysOnTopSettingTab extends PluginSettingTab {
	constructor(app: any, private readonly plugin: AlwaysOnTopPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const createNumberSetting = (
			parent: HTMLElement,
			options: {
				name: string;
				desc: string;
				getValue: () => number;
				onChange: (value: number) => Promise<void>;
				min?: number;
				max?: number;
			}
		) => {
			const min = options.min ?? 0;
			const max = options.max ?? Infinity;

			new Setting(parent)
				.setName(options.name)
				.setDesc(options.desc)
				.addText((text) => {
					text.inputEl.type = 'number';
					text.inputEl.step = '1';
					text.inputEl.addClass('always-on-top-setting-input');
					text.setValue(String(options.getValue()));
					text.onChange(async (raw) => {
						if (raw.trim() === '') {
							return;
						}

						const parsed = Number(raw);
						if (!Number.isFinite(parsed)) {
							return;
						}

						const sanitizedValue = Math.max(min, Math.min(max, Math.round(parsed)));
						await options.onChange(sanitizedValue);
						text.setValue(String(options.getValue()));
					});
				});
		};

		containerEl.createEl('h3', { text: 'Main Window' });
		containerEl.createEl('p', {
			text: 'By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.',
			cls: 'setting-item-description',
		});

		new Setting(containerEl)
			.setName('Show pin indicator')
			.setDesc('When OFF: The pin indicator is completely hidden in the main window, even when pinned.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showIndicatorInMainWindow).onChange(async (value) => {
					this.plugin.settings.showIndicatorInMainWindow = value;
					await this.plugin.persistSettings();
					this.display();
				}),
			);

		if (this.plugin.settings.showIndicatorInMainWindow) {
			createNumberSetting(containerEl, {
				name: 'Top offset (px)',
				desc: 'Distance from the top edge of the main window.',
				getValue: () => this.plugin.settings.mainIndicatorOffsetTop,
				onChange: async (value) => {
					this.plugin.settings.mainIndicatorOffsetTop = value;
					await this.plugin.persistSettings();
				},
			});

			createNumberSetting(containerEl, {
				name: 'Right offset (px)',
				desc: 'Distance from the right edge of the main window.',
				getValue: () => this.plugin.settings.mainIndicatorOffsetRight,
				onChange: async (value) => {
					this.plugin.settings.mainIndicatorOffsetRight = value;
					await this.plugin.persistSettings();
				},
			});

			createNumberSetting(containerEl, {
				name: 'Indicator size (px)',
				desc: 'Width and height of the indicator box.',
				getValue: () => this.plugin.settings.mainIndicatorSize,
				onChange: async (value) => {
					this.plugin.settings.mainIndicatorSize = value;
					await this.plugin.persistSettings();
				},
				min: 20,
				max: 60,
			});

			createNumberSetting(containerEl, {
				name: 'Icon size (px)',
				desc: 'Size of the icon inside the indicator.',
				getValue: () => this.plugin.settings.mainIndicatorIconSize,
				onChange: async (value) => {
					this.plugin.settings.mainIndicatorIconSize = value;
					await this.plugin.persistSettings();
				},
				min: 10,
				max: 50,
			});
		}

		containerEl.createEl('h3', { text: 'Pop-out Windows' });
		containerEl.createEl('p', {
			text: 'By default, the pin indicator is always visible in pop-out windows (highlighted when pinned, gray when unpinned).',
			cls: 'setting-item-description',
		});

		new Setting(containerEl)
			.setName('Show pin indicator')
			.setDesc('When OFF: The pin indicator is completely hidden in pop-out windows.')
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showIndicatorInPopoutWindows).onChange(async (value) => {
					this.plugin.settings.showIndicatorInPopoutWindows = value;
					await this.plugin.persistSettings();
					this.display();
				}),
			);

		if (this.plugin.settings.showIndicatorInPopoutWindows) {
			createNumberSetting(containerEl, {
				name: 'Top offset (px)',
				desc: 'Distance from the top edge of pop-out windows.',
				getValue: () => this.plugin.settings.popoutIndicatorOffsetTop,
				onChange: async (value) => {
					this.plugin.settings.popoutIndicatorOffsetTop = value;
					await this.plugin.persistSettings();
				},
			});

			createNumberSetting(containerEl, {
				name: 'Right offset (px)',
				desc: 'Distance from the right edge of pop-out windows.',
				getValue: () => this.plugin.settings.popoutIndicatorOffsetRight,
				onChange: async (value) => {
					this.plugin.settings.popoutIndicatorOffsetRight = value;
					await this.plugin.persistSettings();
				},
			});

			createNumberSetting(containerEl, {
				name: 'Indicator size (px)',
				desc: 'Width and height of the indicator box.',
				getValue: () => this.plugin.settings.popoutIndicatorSize,
				onChange: async (value) => {
					this.plugin.settings.popoutIndicatorSize = value;
					await this.plugin.persistSettings();
				},
				min: 20,
				max: 60,
			});

			createNumberSetting(containerEl, {
				name: 'Icon size (px)',
				desc: 'Size of the icon inside the indicator.',
				getValue: () => this.plugin.settings.popoutIndicatorIconSize,
				onChange: async (value) => {
					this.plugin.settings.popoutIndicatorIconSize = value;
					await this.plugin.persistSettings();
				},
				min: 10,
				max: 50,
			});
		}
	}
}
