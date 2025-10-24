import { PluginSettingTab, Setting, setIcon } from 'obsidian';
import type AlwaysOnTopPlugin from '../main';
import type { CustomPopoutCommand, PopoutCommandType } from './settings';
import { Notice } from 'obsidian';

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

		// Custom Popout Commands Section
		containerEl.createEl('h3', { text: 'Custom Popout Commands' });
		containerEl.createEl('p', {
			text: 'Create custom commands for opening pop-out windows with different configurations.',
			cls: 'setting-item-description',
		});

		const commandsContainerEl = containerEl.createDiv('synaptic-hatch-custom-commandes-container');
		this.renderCustomCommands(commandsContainerEl);

		new Setting(containerEl)
			.setClass('synaptic-hatch-custom-command-add-button-container')
			.addButton((btn) =>
				btn
					.setButtonText('+ Add Command')
					.setCta()
					.onClick(async () => {
						const newCommand: CustomPopoutCommand = {
							id: `custom-popout-${Date.now()}`,
							name: '',
							type: 'blank',
							enabled: false,
							config: {},
						};
						this.plugin.settings.customPopoutCommands.push(newCommand);
						await this.plugin.persistSettings();
						this.display();
					}),
			);

		// Misc Section
		containerEl.createEl('h3', { text: 'Date & Time Formatting' });
		containerEl.createEl('p', {
			text: 'Note: Avoid special characters not allowed in file names (/ \\ ? * : | " < >)',
			cls: 'setting-item-description',
		});

		new Setting(containerEl)
			.setName('Date format')
			.setDesc('Format for {{date}} substitution (e.g., YYYY-MM-DD)')
			.addText((text) => {
				text.setValue(this.plugin.settings.dateFormat);
				text.onChange(async (value) => {
					this.plugin.settings.dateFormat = value;
					await this.plugin.persistSettings();
				});
			});
	}

	private renderCustomCommands(containerEl: HTMLElement): void {
		if (this.plugin.settings.customPopoutCommands.length === 0) {
			containerEl.createEl('p', {
				text: 'No custom commands yet. Click "Add Command" to create one.',
				cls: 'setting-item-description',
			});
			return;
		}

		this.plugin.settings.customPopoutCommands.forEach((cmd, index) => {
			this.renderCommandRow(containerEl, cmd, index);
		});
	}

	private renderCommandRow(containerEl: HTMLElement, cmd: CustomPopoutCommand, index: number): void {
		// 메인 설정 행 - 한 줄로 구성
		const setting = new Setting(containerEl)
		setting.settingEl.addClass('synaptic-hatch-custom-command-item');
		setting.setName(`#${index + 1}`);
		
		// 타입 드롭다운
		setting.addDropdown((dropdown) => {
			dropdown.addOption('blank', 'blank');
			dropdown.addOption('file', 'file');
			dropdown.addOption('folder', 'folder');
			dropdown.addOption('journal', 'journal');
			dropdown.setValue(cmd.type);
			dropdown.onChange(async (value) => {
				cmd.type = value as PopoutCommandType;
				cmd.config = {}; // 타입 변경 시 config 초기화
				await this.plugin.persistSettings();
				// 전체 다시 렌더링
				this.display();
			});
		});

		// 타입별 입력 필드들
		this.addTypeSpecificControls(setting, cmd);

		// 활성화 토글
		setting.addToggle((toggle) => {
			toggle.setValue(cmd.enabled);
			toggle.onChange(async (value) => {
				cmd.enabled = value;
				await this.plugin.persistSettings();
				// 복사 버튼 상태 업데이트를 위해 다시 렌더링
				this.display();
			});
		});

		// URI 복사 버튼 (Lucide 아이콘)
		setting.addButton((btn) => {
			btn.setTooltip('Copy URI');
			setIcon(btn.buttonEl, 'copy');
			btn.setDisabled(!cmd.enabled);
			btn.onClick(() => {
				if (cmd.enabled) {
					const uri = `obsidian://aot-popup?id=${cmd.id}`;
					navigator.clipboard.writeText(uri);
					new Notice(`Popout command #${index + 1} URI copied to clipboard`);
				}
			});
		});

		// 삭제 버튼 (Lucide 아이콘)
		setting.addButton((btn) => {
			btn.setTooltip('Delete');
			setIcon(btn.buttonEl, 'trash-2');
			btn.setWarning();
			btn.onClick(async () => {
				this.plugin.settings.customPopoutCommands.splice(index, 1);
				await this.plugin.persistSettings();
				this.display();
			});
		});
	}

	private addTypeSpecificControls(setting: Setting, cmd: CustomPopoutCommand): void {
		const wrapper = setting.controlEl.createDiv({ cls: 'synaptic-hatch-custom-command-item-sub-controls' });
	
		switch (cmd.type) {
			case 'blank': {
				new Setting(wrapper)
					.addText((text) => {
						text.setPlaceholder('세부 설정이 없습니다');
						text.setDisabled(true);
					})
					.settingEl.addClass('is-disabled');
				break;
			}
	
			case 'file': {
				new Setting(wrapper)
					.addText((text) => {
						text.setPlaceholder('path/to/file.md');
						text.setValue(cmd.config.filePath || '');
						text.onChange(async (value) => {
							cmd.config.filePath = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.display();
						});
					})
				break;
			}
	
			case 'folder': {
				new Setting(wrapper)
					.addText((text) => {
						text.setPlaceholder('path/to/folder');
						text.setValue(cmd.config.folderPath || '');
						text.onChange(async (value) => {
							cmd.config.folderPath = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.display();
						});
					});
	
				new Setting(wrapper)
					.addText((text) => {
						text.setPlaceholder('File {{date}}');
						text.setValue(cmd.config.fileNameRule || '');
						text.onChange(async (value) => {
							cmd.config.fileNameRule = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.display();
						});
					});
	
				new Setting(wrapper)
					.addText((text) => {
						text.setPlaceholder('Template (optional)');
						text.setValue(cmd.config.templatePath || '');
						text.onChange(async (value) => {
							cmd.config.templatePath = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.display();
						});
					});
				break;
			}
	
			case 'journal': {
				new Setting(wrapper)
					.addDropdown((dropdown) => {
						dropdown.addOption('daily', 'daily');
						dropdown.addOption('weekly', 'weekly');
						dropdown.addOption('monthly', 'monthly');
						dropdown.addOption('quarterly', 'quarterly');
						dropdown.addOption('yearly', 'yearly');
						dropdown.setValue(cmd.config.journalPeriod || 'daily');
						dropdown.onChange(async (value) => {
							cmd.config.journalPeriod = value as any;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.display();
						});
					});
				break;
			}
		}
	}
}
