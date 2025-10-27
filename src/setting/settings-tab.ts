import { PluginSettingTab, Setting, setIcon } from 'obsidian';
import type AlwaysOnTopPlugin from '../../main';
import type { CustomPopoutCommand, PopoutCommandType, JournalPeriod } from './settings';
import { Notice } from 'obsidian';
import type { App } from 'obsidian';
import { registerCustomCommand, removeCustomCommand } from '../commands';
import { getAvailableGranularities, isJournalAvailable } from '../utils/journalUtils';
import { 
	getCustomCommandURI, 
	getFileNameOfPath, 
	getFolderNameOfPath,
	isFileExists,
	isFolderExists,
	hasInvalidFileNameCharacters,
	resolveFileNameRule
} from '../utils/pathUtils';

enum CustomCommandType {
	BLANK = 'blank',
	FILE = 'file',
	FOLDER = 'folder',
	JOURNAL = 'journal',
}

export class AlwaysOnTopSettingTab extends PluginSettingTab {

	plugin: AlwaysOnTopPlugin;

	constructor(app: App, plugin: AlwaysOnTopPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {

		const { containerEl } = this;
		
		containerEl.empty();
		containerEl.addClass('synaptic-hatch-settings');

		/* Section : Main Window Indicator  */
		const mainWindowSection = containerEl.createDiv({ cls: 'synaptic-hatch-section' });
		const mainWindowSectionHeader =mainWindowSection.createDiv({ cls: 'synaptic-hatch-section-header' });
		const mainWindowSectionContent = mainWindowSection.createDiv({ cls: 'synaptic-hatch-section-content' });

		new Setting(mainWindowSectionHeader)
			.setName('Main Window Indicator')
			.setDesc('By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.')
			.setHeading();
		
		new Setting(mainWindowSectionHeader)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showIndicatorInMainWindow).onChange(async (value) => {
					this.plugin.settings.showIndicatorInMainWindow = value;
					await this.plugin.persistSettings();
					if(!value){
						mainWindowSectionContent.addClass('hidden')
					}else{
						mainWindowSectionContent.removeClass('hidden')
					}
				}),
			);
		
		if(!this.plugin.settings.showIndicatorInMainWindow){
			mainWindowSectionContent.addClass('hidden')
		}else{
			mainWindowSectionContent.removeClass('hidden')
		}

		this.createMinWindowSectionContent(mainWindowSectionContent);


		/* Section : Pop-out Window Indicator */
		const popoutWindowSection = containerEl.createDiv({ cls: 'synaptic-hatch-section' });
		const popoutWindowSectionHeader =popoutWindowSection.createDiv({ cls: 'synaptic-hatch-section-header' });
		const popoutWindowSectionContent = popoutWindowSection.createDiv({ cls: 'synaptic-hatch-section-content' });

		new Setting(popoutWindowSectionHeader)
			.setName('Pop-out Window Indicator')
			.setDesc('By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.')
			.setHeading();
		
		new Setting(popoutWindowSectionHeader)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.showIndicatorInPopoutWindows).onChange(async (value) => {
					this.plugin.settings.showIndicatorInPopoutWindows = value;
					await this.plugin.persistSettings();
					if(!value){
						popoutWindowSectionContent.addClass('hidden')
					}else{
						popoutWindowSectionContent.removeClass('hidden')
					}
				}),
			);
		
		if(!this.plugin.settings.showIndicatorInPopoutWindows){
			popoutWindowSectionContent.addClass('hidden')
		}else{
			popoutWindowSectionContent.removeClass('hidden')
		}

		this.createPopoutWindowSectionContent(popoutWindowSectionContent);


		/* Section : Custom Popout Commands */
		const customPopoutCommandsSection = containerEl.createDiv({ cls: 'synaptic-hatch-section' });
		const customPopoutCommandsSectionHeader =customPopoutCommandsSection.createDiv({ cls: 'synaptic-hatch-section-header' });
		const customPopoutCommandsSectionContent = customPopoutCommandsSection.createDiv({ cls: 'synaptic-hatch-section-content' });
		const customPopoutCommandsSettingsContainer = customPopoutCommandsSectionContent.createDiv({ cls: 'synaptic-hatch-custom-commandes-container' });
		const customPopoutCommandsAddButtonContainer = customPopoutCommandsSectionContent.createDiv({ cls: 'synaptic-hatch-custom-command-add-button-container' });

		new Setting(customPopoutCommandsSectionHeader)
			.setName('Custom Popout Commands')
			.setDesc('Create custom commands for opening pop-out windows with different configurations.')
			.setHeading();
		
		new Setting(customPopoutCommandsSectionHeader)
			.addToggle((toggle) =>
				toggle.setValue(this.plugin.settings.useCustomPopoutCommands).onChange(async (value) => {
					this.plugin.settings.useCustomPopoutCommands = value;
					await this.plugin.persistSettings();
					if(!value){
						customPopoutCommandsSectionContent.addClass('hidden')
					}else{
						customPopoutCommandsSectionContent.removeClass('hidden')
					}
				}),
			);
		
		if(!this.plugin.settings.useCustomPopoutCommands){
			customPopoutCommandsSectionContent.addClass('hidden')
		}else{
			customPopoutCommandsSectionContent.removeClass('hidden')
		}

		this.renderCustomCommandsSectionContent(customPopoutCommandsSettingsContainer);

		new Setting(customPopoutCommandsAddButtonContainer)
		.setClass('synaptic-hatch-custom-command-add-button-container')
		.addButton((btn) =>
			btn
				.setButtonText('+ Add Command')
				.setCta()
				.onClick(async () => {
					const newCommand: CustomPopoutCommand = {
						id: `custom-popout-${Date.now()}`,
						name: '',
						enabled: false,
						config: {},
						type: 'file',
					};
					this.plugin.settings.customPopoutCommands.push(newCommand);
					await this.plugin.persistSettings();
					this.renderCustomCommandsSectionContent(customPopoutCommandsSettingsContainer);
				}),
		);


		/* Section : Misc */
		const miscSection = containerEl.createDiv({ cls: 'synaptic-hatch-section' });
		const miscSectionHeader =miscSection.createDiv({ cls: 'synaptic-hatch-section-header' });
		const miscSectionContent = miscSection.createDiv({ cls: 'synaptic-hatch-section-content' });

		new Setting(miscSectionHeader)
			.setName('Miscellaneous')
			.setDesc('Miscellaneous settings for the plugin.')
			.setHeading();

		new Setting(miscSectionContent)
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

	private renderCommandRow(containerEl: HTMLElement, cmd: CustomPopoutCommand, index: number, customCommandsSectionContent: HTMLElement): void {
		
		const commandRow = containerEl.createDiv({ cls: `synaptic-hatch-custom-command-item row-${index + 1}`});
		const number = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-number' });
		const type = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-type' });
		const options = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-options' });
		const enable = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-enable' });
		const copy = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-copy' });
		const remove = commandRow.createDiv({ cls: 'synaptic-hatch-custom-command-item-remove' });

		number.setText(`#${index + 1}`);

		new Setting(type)
			.addDropdown((dropdown) => {
				// type이 미정일 때만 선택 프롬프트 표시 (짧게)
				dropdown.addOption('blank', 'Blank');
				dropdown.addOption('file', 'File');
				dropdown.addOption('folder', 'Folder');

				if(isJournalAvailable()){
					dropdown.addOption('journal', 'Journal');
				}
				dropdown.setValue(cmd.type || '');
				dropdown.onChange(async (value) => {
					cmd.type = value as PopoutCommandType;
					cmd.config = {};
					await this.plugin.persistSettings();
					this.renderCustomCommandOptions(options, value as PopoutCommandType, cmd, enable);
					this.disableCustomCommandItem(enable, cmd);
				});
			});

		if (cmd.type) {
			this.renderCustomCommandOptions(options, cmd.type, cmd, enable);
		}
		
		new Setting(enable)
		.addToggle((toggle) => {
			toggle.setValue(cmd.enabled);
			toggle.onChange(async (value) => {
				if(value){
					// Enable 시도: 먼저 유효성 검사
					const validationError = this.validateCustomCommandOptions(cmd);
					if (validationError) {
						// 유효성 검사 실패: disable 상태로 유지
						new Notice(validationError);
						this.disableCustomCommandItem(enable, cmd);
						return;
					}
					// 유효성 검사 성공: enable
					cmd.enabled = true;
					this.renderCustomCommandsSectionContent(customCommandsSectionContent);
					this.setNameOfCustomPopoutCommand(cmd);
					await this.plugin.persistSettings();
					registerCustomCommand(this.plugin, cmd, this.plugin.popouts);
				}else{
					// Disable
					cmd.enabled = false;
					this.renderCustomCommandsSectionContent(customCommandsSectionContent);
					this.setNameOfCustomPopoutCommand(cmd);
					await this.plugin.persistSettings();
					removeCustomCommand(this.plugin, cmd);
				}
			});
		});

		new Setting(copy)
			.addButton((btn) => {
				btn.setTooltip('Copy URI');
				setIcon(btn.buttonEl, 'copy');
				btn.setDisabled(!cmd.enabled);
				btn.onClick(() => {
					if (cmd.enabled) {
						const uri = getCustomCommandURI(this.plugin, cmd);
						navigator.clipboard.writeText(uri);
						new Notice(`Custom command #${index + 1} URI copied to clipboard`);
					}
				});
			});

		new Setting(remove)
			.addButton((btn) => {
				btn.setTooltip('Delete');
				setIcon(btn.buttonEl, 'trash-2');
				btn.setWarning();
				btn.onClick(async () => {
					this.plugin.settings.customPopoutCommands.splice(index, 1);
					await this.plugin.persistSettings();
					this.renderCustomCommandsSectionContent(customCommandsSectionContent);
					removeCustomCommand(this.plugin, cmd);
				});
			});
	
	}

	private createNumberSetting(
		parent: HTMLElement,
		options: {
			name: string;
			desc: string;
			getValue: () => number;
			onChange: (value: number) => Promise<void>;
			min?: number;
			max?: number;
		}
	) {
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

	private createMinWindowSectionContent(mainWindowSectionContent: HTMLElement): void {
		this.createNumberSetting(mainWindowSectionContent, {
			name: 'Top offset (px)',
			desc: 'Distance from the top edge of the main window.',
			getValue: () => this.plugin.settings.mainIndicatorOffsetTop,
			onChange: async (value) => {
				this.plugin.settings.mainIndicatorOffsetTop = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(mainWindowSectionContent, {
			name: 'Right offset (px)',
			desc: 'Distance from the right edge of the main window.',
			getValue: () => this.plugin.settings.mainIndicatorOffsetRight,
			onChange: async (value) => {
				this.plugin.settings.mainIndicatorOffsetRight = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(mainWindowSectionContent, {
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

		this.createNumberSetting(mainWindowSectionContent, {
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

	private createPopoutWindowSectionContent(popoutWindowSectionContent: HTMLElement): void {
		this.createNumberSetting(popoutWindowSectionContent, {
			name: 'Top offset (px)',
			desc: 'Distance from the top edge of pop-out windows.',
			getValue: () => this.plugin.settings.popoutIndicatorOffsetTop,
			onChange: async (value) => {
				this.plugin.settings.popoutIndicatorOffsetTop = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(popoutWindowSectionContent, {
			name: 'Right offset (px)',
			desc: 'Distance from the right edge of pop-out windows.',
			getValue: () => this.plugin.settings.popoutIndicatorOffsetRight,
			onChange: async (value) => {
				this.plugin.settings.popoutIndicatorOffsetRight = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(popoutWindowSectionContent, {
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

		this.createNumberSetting(popoutWindowSectionContent, {
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

	private renderCustomCommandsSectionContent(customCommandsSectionContent: HTMLElement): void {
		customCommandsSectionContent.empty();
		const customCommands = this.plugin.settings.customPopoutCommands;
		const isExist = customCommands.length > 0;

		if(!isExist){
			customCommandsSectionContent.createEl('p', {
				text: 'No custom commands yet.',
				cls: 'setting-item-description',
			});
		}else{
			customCommands.forEach((cmd, index) => {
				this.renderCommandRow(customCommandsSectionContent, cmd, index, customCommandsSectionContent);
			});
		}
	}

	private renderCustomCommandOptions(options: HTMLElement, type: PopoutCommandType, cmd: CustomPopoutCommand, enable: HTMLElement): void {
		options.empty();

		if(type === CustomCommandType.BLANK){
			new Setting(options)
				.addText((text) => {
					text.setPlaceholder('Open a new blank Always-on-Top Popout Window');
					text.setDisabled(true);
				})
				.settingEl.addClass('is-disabled');
		}
		
		if(type === CustomCommandType.FILE){
			new Setting(options)
				.addText((text) => {
					text.setPlaceholder('Enter a file path');
					text.setValue(cmd.config.filePath || '');
					// text.inputEl.dataset.tooltip = 'Enter a file path';
					text.onChange(async (value) => {
						cmd.config.filePath = value;
						cmd.enabled = false;
						await this.plugin.persistSettings();
						this.disableCustomCommandItem(enable, cmd);
					});
				});
		}

		if(type === CustomCommandType.FOLDER){
			new Setting(options)
					.addText((text) => {
						text.setPlaceholder('Enter a folder path');
						text.setValue(cmd.config.folderPath || '');
						// text.inputEl.dataset.tooltip = 'Enter a folder path';
						text.onChange(async (value) => {
							cmd.config.folderPath = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.disableCustomCommandItem(enable, cmd);
						});
					});
	
				new Setting(options)
					.addText((text) => {
						text.setPlaceholder('Filename rule ({{date}} optional');
						text.setValue(cmd.config.fileNameRule || '');
						// text.inputEl.dataset.tooltip = 'Enter a file name rule';
						text.onChange(async (value) => {
							cmd.config.fileNameRule = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.disableCustomCommandItem(enable, cmd);
						});
					});
	
				new Setting(options)
					.addText((text) => {
						text.setPlaceholder('Enter a template file path');
						text.setValue(cmd.config.templatePath || '');
						text.inputEl.dataset.tooltip = 'Enter a template file path';
						text.onChange(async (value) => {
							cmd.config.templatePath = value;
							cmd.enabled = false;
							await this.plugin.persistSettings();
							this.disableCustomCommandItem(enable, cmd);
						});
					});
		}

		if(type === CustomCommandType.JOURNAL){

			const availableGranularities = getAvailableGranularities();

			new Setting(options)
			.addDropdown((dropdown) => {
				availableGranularities.forEach((granularity) => {
					dropdown.addOption(granularity, granularity);
				});
				if(cmd.config.journalPeriod){
					dropdown.setValue(cmd.config.journalPeriod);
				}else{
					dropdown.setValue(availableGranularities[0]);
					cmd.config.journalPeriod = availableGranularities[0];
				}
				dropdown.onChange(async (value) => {
					cmd.config.journalPeriod = value as JournalPeriod;
					cmd.enabled = false;
					await this.plugin.persistSettings();
					this.disableCustomCommandItem(enable, cmd);
				});
			});
		}
	}

	private disableCustomCommandItem(enable: HTMLElement, cmd: CustomPopoutCommand): void {
		enable.empty();
	
		new Setting(enable)
			.addToggle((toggle) => {
				toggle.setValue(false);
				cmd.enabled = false;
				void this.plugin.persistSettings();
				toggle.onChange(async (value) => {
					if(value){
						// Enable 시도: 먼저 유효성 검사
						const validationError = this.validateCustomCommandOptions(cmd);
						if (validationError) {
							// 유효성 검사 실패: disable 상태로 유지
							new Notice(validationError);
							toggle.setValue(false);
							cmd.enabled = false;
							await this.plugin.persistSettings();
							return;
						}
						// 유효성 검사 성공: enable
						cmd.enabled = true;
						await this.setNameOfCustomPopoutCommand(cmd);
						await this.plugin.persistSettings();
						registerCustomCommand(this.plugin, cmd, this.plugin.popouts);
					}else{
						// Disable
						cmd.enabled = false;
						await this.setNameOfCustomPopoutCommand(cmd);
						await this.plugin.persistSettings();
						removeCustomCommand(this.plugin, cmd);
					}
				});
			})
			
	}

	private async setNameOfCustomPopoutCommand(customCommand: CustomPopoutCommand){
		const type = customCommand.type;
	
		switch(type){
			case 'blank':
				customCommand.name = 'Custom Popout> Open a new blank Always-on-Top Popout Window';
				break;
			case 'file':
				const fileName = getFileNameOfPath(customCommand.config.filePath || '');
				customCommand.name = `Custom Popout> Open <${fileName}> in an Always-on-Top Popout Window`;
				break;
			case 'folder':
				const folder = getFolderNameOfPath(customCommand.config.folderPath || '');
				customCommand.name = `Custom Popout> Create a new note in <${folder}> and open it in an Always-on-Top Popout Window`;
				break;
			case 'journal':
				const subType = customCommand.config.journalPeriod || 'daily';
				customCommand.name = `Custom Popout> Open <${subType}> journal in an Always-on-Top Popout Window`;
				break;
		}
	}

	/**
	 * 커스텀 명령 옵션의 유효성을 검사
	 * @returns 유효하면 null, 문제가 있으면 에러 메시지 반환
	 */
	private validateCustomCommandOptions(cmd: CustomPopoutCommand): string | null {

		if(cmd.type === CustomCommandType.FILE){
			const filePath = cmd.config.filePath;
			
			if (!filePath) {
				return 'File path is required.';
			}

			if (!isFileExists(this.plugin, filePath)) {
				return `File does not exist: ${filePath}`;
			}
		}

		if(cmd.type === CustomCommandType.FOLDER){
			const folderPath = cmd.config.folderPath || '';
			const fileNameRule = cmd.config.fileNameRule;
			const templatePath = cmd.config.templatePath || '';
			
			// 폴더 경로 검증
			if (folderPath && !isFolderExists(this.plugin, folderPath)) {
				return `Folder does not exist: ${folderPath}`;
			}

			// 파일명 규칙 검증
			if (!fileNameRule) {
				return 'File name rule is required.';
			}

			// 날짜 치환 후 파일명 검증
			const resolvedFileName = resolveFileNameRule(fileNameRule, this.plugin.settings.dateFormat);
			
			if (hasInvalidFileNameCharacters(resolvedFileName)) {
				return `Invalid characters in file name: ${resolvedFileName}`;
			}

			// 템플릿 경로 검증
			if (templatePath && !isFileExists(this.plugin, templatePath)) {
				return `Template file does not exist: ${templatePath}`;
			}
		}

		if(cmd.type === CustomCommandType.JOURNAL){
			// Journal은 플러그인 설정에 의존하므로 별도 검증 불필요
			// isJournalAvailable()로 이미 체크됨
		}

		return null; // 유효함
	}
}
