import { PluginSettingTab, Setting } from 'obsidian';
import type AlwaysOnTopPlugin from '../main';

export class AlwaysOnTopSettingTab extends PluginSettingTab {
	constructor(app: any, private readonly plugin: AlwaysOnTopPlugin) {
		super(app, plugin);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		const createOffsetSetting = (
			parent: HTMLElement,
			options: {
				name: string;
				desc: string;
				getValue: () => number;
				onChange: (value: number) => Promise<void>;
			}
		) => {
			new Setting(parent)
				.setName(options.name)
				.setDesc(options.desc)
				.addText((text) => {
					text.inputEl.type = 'number';
					text.inputEl.min = '0';
					text.inputEl.step = '1';
					text.setValue(String(options.getValue()));
					text.onChange(async (raw) => {
						if (raw.trim() === '') {
							return;
						}

						const parsed = Number(raw);
						if (!Number.isFinite(parsed)) {
							return;
						}

						const sanitizedValue = Math.max(0, Math.round(parsed));
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
				}),
			);

		createOffsetSetting(containerEl, {
			name: 'Top offset (px)',
			desc: 'Distance from the top edge of the main window.',
			getValue: () => this.plugin.settings.mainIndicatorOffsetTop,
			onChange: async (value) => {
				this.plugin.settings.mainIndicatorOffsetTop = value;
				await this.plugin.persistSettings();
			},
		});

		createOffsetSetting(containerEl, {
			name: 'Right offset (px)',
			desc: 'Distance from the right edge of the main window.',
			getValue: () => this.plugin.settings.mainIndicatorOffsetRight,
			onChange: async (value) => {
				this.plugin.settings.mainIndicatorOffsetRight = value;
				await this.plugin.persistSettings();
			},
		});

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
				}),
			);

		createOffsetSetting(containerEl, {
			name: 'Top offset (px)',
			desc: 'Distance from the top edge of pop-out windows.',
			getValue: () => this.plugin.settings.popoutIndicatorOffsetTop,
			onChange: async (value) => {
				this.plugin.settings.popoutIndicatorOffsetTop = value;
				await this.plugin.persistSettings();
			},
		});

		createOffsetSetting(containerEl, {
			name: 'Right offset (px)',
			desc: 'Distance from the right edge of pop-out windows.',
			getValue: () => this.plugin.settings.popoutIndicatorOffsetRight,
			onChange: async (value) => {
				this.plugin.settings.popoutIndicatorOffsetRight = value;
				await this.plugin.persistSettings();
			},
		});
	}
}
