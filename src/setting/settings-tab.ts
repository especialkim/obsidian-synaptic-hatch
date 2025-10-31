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
import { FileSuggest } from '../suggest/FileSuggest';
import { FolderSuggest } from '../suggest/FolderSuggest';
import { i18n } from '../utils/i18n';

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

	/**
	 * Creates a collapsible section with a toggle switch in the header.
	 * Reusable component for creating consistent section layouts.
	 */
	private createCollapsibleSection(config: {
		container: HTMLElement;
		name: string;
		desc: string;
		isEnabled: () => boolean;
		onToggle: (value: boolean) => Promise<void>;
		renderContent: (contentEl: HTMLElement) => void;
	}): { sectionEl: HTMLElement; headerEl: HTMLElement; contentEl: HTMLElement } {
		const sectionEl = config.container.createDiv({ cls: 'synaptic-hatch-section' });
		const headerEl = sectionEl.createDiv({ cls: 'synaptic-hatch-section-header' });
		const contentEl = sectionEl.createDiv({ cls: 'synaptic-hatch-section-content' });

		// Create heading
		new Setting(headerEl)
			.setName(config.name)
			.setDesc(config.desc)
			.setHeading();

		// Create toggle
		new Setting(headerEl)
			.addToggle((toggle) =>
				toggle.setValue(config.isEnabled()).onChange(async (value) => {
					await config.onToggle(value);
					this.toggleSectionVisibility(contentEl, value);
				}),
			);

		// Set initial visibility
		this.toggleSectionVisibility(contentEl, config.isEnabled());

		// Render content
		config.renderContent(contentEl);

		return { sectionEl, headerEl, contentEl };
	}

	/**
	 * Toggles the visibility of a section content element.
	 */
	private toggleSectionVisibility(element: HTMLElement, isVisible: boolean): void {
		if (isVisible) {
			element.removeClass('hidden');
		} else {
			element.addClass('hidden');
		}
	}

	display(): void {
		const { containerEl } = this;
		
		containerEl.empty();
		containerEl.addClass('synaptic-hatch-settings');

		/* Section : Main Window Indicator  */
		this.createCollapsibleSection({
			container: containerEl,
			name: i18n.t('setting.mainWindowIndicator'),
			desc: i18n.t('setting.mainWindowIndicatorDesc'),
			isEnabled: () => this.plugin.settings.showIndicatorInMainWindow,
			onToggle: async (value) => {
				this.plugin.settings.showIndicatorInMainWindow = value;
				await this.plugin.persistSettings();
			},
			renderContent: (contentEl) => this.createMinWindowSectionContent(contentEl),
		});

		/* Section : Pop-out Window Indicator */
		this.createCollapsibleSection({
			container: containerEl,
			name: i18n.t('setting.popoutWindowIndicator'),
			desc: i18n.t('setting.popoutWindowIndicatorDesc'),
			isEnabled: () => this.plugin.settings.showIndicatorInPopoutWindows,
			onToggle: async (value) => {
				this.plugin.settings.showIndicatorInPopoutWindows = value;
				await this.plugin.persistSettings();
			},
			renderContent: (contentEl) => this.createPopoutWindowSectionContent(contentEl),
		});

		/* Section : Custom Popout Commands */
		const { contentEl: customCommandsContentEl } = this.createCollapsibleSection({
			container: containerEl,
			name: i18n.t('setting.customPopoutCommands'),
			desc: i18n.t('setting.customPopoutCommandsDesc'),
			isEnabled: () => this.plugin.settings.useCustomPopoutCommands,
			onToggle: async (value) => {
				this.plugin.settings.useCustomPopoutCommands = value;
				await this.plugin.persistSettings();
			},
			renderContent: (contentEl) => {
				const settingsContainer = contentEl.createDiv({ cls: 'synaptic-hatch-custom-commandes-container' });
				const addButtonContainer = contentEl.createDiv({ cls: 'synaptic-hatch-custom-command-add-button-container' });

				this.renderCustomCommandsSectionContent(settingsContainer);

				new Setting(addButtonContainer)
					.setClass('synaptic-hatch-custom-command-add-button-container')
					.addButton((btn) =>
						btn
							.setButtonText(i18n.t('setting.addCommand'))
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
								this.renderCustomCommandsSectionContent(settingsContainer);
							}),
					);
			},
		});

		/* Section : Misc */
		const miscSection = containerEl.createDiv({ cls: 'synaptic-hatch-section' });
		const miscSectionHeader = miscSection.createDiv({ cls: 'synaptic-hatch-section-header' });
		const miscSectionContent = miscSection.createDiv({ cls: 'synaptic-hatch-section-content' });

		new Setting(miscSectionHeader)
			.setName(i18n.t('setting.miscellaneous'))
			.setDesc(i18n.t('setting.miscellaneousDesc'))
			.setHeading();

		new Setting(miscSectionContent)
			.setName(i18n.t('setting.dateFormat'))
			.setDesc(i18n.t('setting.dateFormatDesc'))
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
				dropdown.addOption('blank', i18n.t('setting.blank'));
				dropdown.addOption('file', i18n.t('setting.file'));
				dropdown.addOption('folder', i18n.t('setting.folder'));

				if(isJournalAvailable()){
					dropdown.addOption('journal', i18n.t('setting.journal'));
				}
				dropdown.setValue(cmd.type || '');
				dropdown.onChange(async (value) => {
					cmd.type = value as PopoutCommandType;
					cmd.config = {};
					await this.plugin.persistSettings();
					this.renderCustomCommandOptions(options, value as PopoutCommandType, cmd, enable, customCommandsSectionContent);
					this.disableCustomCommandItem(enable, cmd, customCommandsSectionContent);
				});
			});

		if (cmd.type) {
			this.renderCustomCommandOptions(options, cmd.type, cmd, enable, customCommandsSectionContent);
		}
		
		this.createCommandToggle(enable, cmd, customCommandsSectionContent);

		new Setting(copy)
			.addButton((btn) => {
				btn.setTooltip(i18n.t('setting.copyURI'));
				setIcon(btn.buttonEl, 'copy');
				btn.setDisabled(!cmd.enabled);
				btn.onClick(() => {
					if (cmd.enabled) {
						const uri = getCustomCommandURI(this.plugin, cmd);
						navigator.clipboard.writeText(uri);
						new Notice(i18n.t('notice.uriCopied', { number: String(index + 1) }));
					}
				});
			});

		new Setting(remove)
			.addButton((btn) => {
				btn.setTooltip(i18n.t('setting.delete'));
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

	/**
	 * Creates a number input setting with validation.
	 * Reusable component for numeric configuration fields.
	 */
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
	}

	/**
	 * Creates indicator settings for a specific window type.
	 * Consolidated method for both main and popout window indicators.
	 */
	private createIndicatorSettings(
		container: HTMLElement,
		type: 'main' | 'popout'
	): void {
		const prefix = type === 'main' ? 'main' : 'popout';
		const windowLabel = type === 'main' ? 'main window' : 'pop-out windows';

		this.createNumberSetting(container, {
			name: i18n.t('setting.topOffset'),
			desc: i18n.t('setting.topOffsetDesc'),
			getValue: () => this.plugin.settings[`${prefix}IndicatorOffsetTop`],
			onChange: async (value) => {
				this.plugin.settings[`${prefix}IndicatorOffsetTop`] = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(container, {
			name: i18n.t('setting.rightOffset'),
			desc: i18n.t('setting.rightOffsetDesc'),
			getValue: () => this.plugin.settings[`${prefix}IndicatorOffsetRight`],
			onChange: async (value) => {
				this.plugin.settings[`${prefix}IndicatorOffsetRight`] = value;
				await this.plugin.persistSettings();
			},
		});

		this.createNumberSetting(container, {
			name: i18n.t('setting.indicatorSize'),
			desc: i18n.t('setting.indicatorSizeDesc'),
			getValue: () => this.plugin.settings[`${prefix}IndicatorSize`],
			onChange: async (value) => {
				this.plugin.settings[`${prefix}IndicatorSize`] = value;
				await this.plugin.persistSettings();
			},
			min: 20,
			max: 60,
		});

		this.createNumberSetting(container, {
			name: i18n.t('setting.iconSize'),
			desc: i18n.t('setting.iconSizeDesc'),
			getValue: () => this.plugin.settings[`${prefix}IndicatorIconSize`],
			onChange: async (value) => {
				this.plugin.settings[`${prefix}IndicatorIconSize`] = value;
				await this.plugin.persistSettings();
			},
			min: 10,
			max: 50,
		});
	}

	private createMinWindowSectionContent(mainWindowSectionContent: HTMLElement): void {
		this.createIndicatorSettings(mainWindowSectionContent, 'main');
	}

	private createPopoutWindowSectionContent(popoutWindowSectionContent: HTMLElement): void {
		this.createIndicatorSettings(popoutWindowSectionContent, 'popout');
	}

	private renderCustomCommandsSectionContent(customCommandsSectionContent: HTMLElement): void {
		customCommandsSectionContent.empty();
		const customCommands = this.plugin.settings.customPopoutCommands;
		const isExist = customCommands.length > 0;

		if(!isExist){
			customCommandsSectionContent.createEl('p', {
				text: i18n.t('setting.noCustomCommands'),
				cls: 'setting-item-description',
			});
		}else{
			customCommands.forEach((cmd, index) => {
				this.renderCommandRow(customCommandsSectionContent, cmd, index, customCommandsSectionContent);
			});
		}
	}

	/**
	 * Handles configuration changes for custom commands.
	 * Disables the command and persists the settings.
	 */
	private async handleConfigChange(
		cmd: CustomPopoutCommand,
		enableEl: HTMLElement,
		customCommandsSectionContent: HTMLElement
	): Promise<void> {
		cmd.enabled = false;
		await this.plugin.persistSettings();
		this.disableCustomCommandItem(enableEl, cmd, customCommandsSectionContent);
	}

	/**
	 * Renders options UI based on the command type.
	 * Delegates to type-specific render methods.
	 */
	private renderCustomCommandOptions(
		options: HTMLElement, 
		type: PopoutCommandType, 
		cmd: CustomPopoutCommand, 
		enable: HTMLElement, 
		customCommandsSectionContent: HTMLElement
	): void {
		options.empty();

		const context = { options, cmd, enable, customCommandsSectionContent };

		switch (type) {
			case CustomCommandType.BLANK:
				this.renderBlankTypeOptions(context);
				break;
			case CustomCommandType.FILE:
				this.renderFileTypeOptions(context);
				break;
			case CustomCommandType.FOLDER:
				this.renderFolderTypeOptions(context);
				break;
			case CustomCommandType.JOURNAL:
				this.renderJournalTypeOptions(context);
				break;
		}
	}

	/**
	 * Renders options for blank type commands.
	 */
	private renderBlankTypeOptions(context: {
		options: HTMLElement;
		cmd: CustomPopoutCommand;
		enable: HTMLElement;
		customCommandsSectionContent: HTMLElement;
	}): void {
		new Setting(context.options)
			.addText((text) => {
				text.setPlaceholder(i18n.t('setting.blankDescription'));
				text.setDisabled(true);
			})
			.settingEl.addClass('is-disabled');
	}

	/**
	 * Renders options for file type commands.
	 */
	private renderFileTypeOptions(context: {
		options: HTMLElement;
		cmd: CustomPopoutCommand;
		enable: HTMLElement;
		customCommandsSectionContent: HTMLElement;
	}): void {
		new Setting(context.options)
			.addText((text) => {
				text.setPlaceholder(i18n.t('setting.enterFilePath'));
				text.setValue(context.cmd.config.filePath || '');
				text.onChange(async (value) => {
					context.cmd.config.filePath = value;
					await this.handleConfigChange(context.cmd, context.enable, context.customCommandsSectionContent);
				});
				new FileSuggest(this.app, text.inputEl, this.plugin);
			});
	}

	/**
	 * Renders options for folder type commands.
	 */
	private renderFolderTypeOptions(context: {
		options: HTMLElement;
		cmd: CustomPopoutCommand;
		enable: HTMLElement;
		customCommandsSectionContent: HTMLElement;
	}): void {
		// Folder path input
		new Setting(context.options)
			.addText((text) => {
				text.setPlaceholder(i18n.t('setting.enterFolderPath'));
				text.setValue(context.cmd.config.folderPath || '');
				text.onChange(async (value) => {
					context.cmd.config.folderPath = value;
					await this.handleConfigChange(context.cmd, context.enable, context.customCommandsSectionContent);
				});
				new FolderSuggest(this.app, text.inputEl, this.plugin);
			});

		// File name rule input
		new Setting(context.options)
			.addText((text) => {
				text.setPlaceholder(i18n.t('setting.filenameRule'));
				text.setValue(context.cmd.config.fileNameRule || '');
				text.onChange(async (value) => {
					context.cmd.config.fileNameRule = value;
					await this.handleConfigChange(context.cmd, context.enable, context.customCommandsSectionContent);
				});
			});

		// Template path input
		new Setting(context.options)
			.addText((text) => {
				text.setPlaceholder(i18n.t('setting.enterTemplatePath'));
				text.setValue(context.cmd.config.templatePath || '');
				text.inputEl.dataset.tooltip = i18n.t('setting.enterTemplatePath');
				text.onChange(async (value) => {
					context.cmd.config.templatePath = value;
					await this.handleConfigChange(context.cmd, context.enable, context.customCommandsSectionContent);
				});
				new FileSuggest(this.app, text.inputEl, this.plugin);
			});
	}

	/**
	 * Renders options for journal type commands.
	 */
	private renderJournalTypeOptions(context: {
		options: HTMLElement;
		cmd: CustomPopoutCommand;
		enable: HTMLElement;
		customCommandsSectionContent: HTMLElement;
	}): void {
		const availableGranularities = getAvailableGranularities();
		
		// 저널 그래뉼러리티를 번역된 레이블로 매핑
		const granularityLabels: Record<string, string> = {
			'daily': i18n.t('journal.daily'),
			'weekly': i18n.t('journal.weekly'),
			'monthly': i18n.t('journal.monthly'),
			'quarterly': i18n.t('journal.quarterly'),
			'yearly': i18n.t('journal.yearly'),
		};

		new Setting(context.options)
			.addDropdown((dropdown) => {
				availableGranularities.forEach((granularity) => {
					dropdown.addOption(granularity, granularityLabels[granularity] || granularity);
				});
				
				if (context.cmd.config.journalPeriod) {
					dropdown.setValue(context.cmd.config.journalPeriod);
				} else {
					dropdown.setValue(availableGranularities[0]);
					context.cmd.config.journalPeriod = availableGranularities[0];
				}

				dropdown.onChange(async (value) => {
					context.cmd.config.journalPeriod = value as JournalPeriod;
					await this.handleConfigChange(context.cmd, context.enable, context.customCommandsSectionContent);
				});
			});
	}

	/**
	 * Creates a toggle control for enabling/disabling custom commands.
	 * Handles validation, command registration, and UI updates.
	 */
	private createCommandToggle(
		container: HTMLElement,
		cmd: CustomPopoutCommand,
		customCommandsSectionContent: HTMLElement
	): void {
		new Setting(container)
			.addToggle((toggle) => {
				toggle.setValue(cmd.enabled);
				toggle.onChange(async (value) => {
					if (value) {
						// Attempt to enable: validate first
						const validationError = this.validateCustomCommandOptions(cmd);
						if (validationError) {
							// Validation failed: keep disabled
							new Notice(validationError);
							toggle.setValue(false);
							cmd.enabled = false;
							await this.plugin.persistSettings();
							return;
						}
						// Validation successful: enable
						cmd.enabled = true;
						await this.setNameOfCustomPopoutCommand(cmd);
						await this.plugin.persistSettings();
						registerCustomCommand(this.plugin, cmd, this.plugin.popouts);
						this.renderCustomCommandsSectionContent(customCommandsSectionContent);
					} else {
						// Disable
						cmd.enabled = false;
						await this.setNameOfCustomPopoutCommand(cmd);
						await this.plugin.persistSettings();
						removeCustomCommand(this.plugin, cmd);
						this.renderCustomCommandsSectionContent(customCommandsSectionContent);
					}
				});
			});
	}

	/**
	 * Disables a custom command item by clearing and recreating the toggle.
	 */
	private disableCustomCommandItem(
		enable: HTMLElement,
		cmd: CustomPopoutCommand,
		customCommandsSectionContent: HTMLElement
	): void {
		enable.empty();
		cmd.enabled = false;
		void this.plugin.persistSettings();
		this.createCommandToggle(enable, cmd, customCommandsSectionContent);
	}

	private async setNameOfCustomPopoutCommand(customCommand: CustomPopoutCommand){
		const type = customCommand.type;
	
		switch(type){
			case 'blank':
				customCommand.name = `Custom Popout, ${i18n.t('customCommand.blank')}`;
				break;
			case 'file':
				const fileName = getFileNameOfPath(customCommand.config.filePath || '');
				customCommand.name = `Custom Popout, ${i18n.t('customCommand.file', { filename: fileName })}`;
				break;
			case 'folder':
				const folder = getFolderNameOfPath(customCommand.config.folderPath || '');
				customCommand.name = `Custom Popout, ${i18n.t('customCommand.folder', { folder })}`;
				break;
			case 'journal':
				const subType = customCommand.config.journalPeriod || 'daily';
				customCommand.name = `Custom Popout, ${i18n.t('customCommand.journal', { period: subType })}`;
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
				return i18n.t('validation.filePathRequired');
			}

			if (!isFileExists(this.plugin, filePath)) {
				return i18n.t('validation.fileNotExists', { path: filePath });
			}
		}

		if(cmd.type === CustomCommandType.FOLDER){
			const folderPath = cmd.config.folderPath || '';
			const fileNameRule = cmd.config.fileNameRule;
			const templatePath = cmd.config.templatePath || '';
			
			// 폴더 경로 검증
			if (folderPath && !isFolderExists(this.plugin, folderPath)) {
				return i18n.t('validation.folderNotExists', { path: folderPath });
			}

			// 파일명 규칙 검증
			if (!fileNameRule) {
				return i18n.t('validation.filenameRuleRequired');
			}

			// 날짜 치환 후 파일명 검증
			const resolvedFileName = resolveFileNameRule(fileNameRule, this.plugin.settings.dateFormat);
			
			if (hasInvalidFileNameCharacters(resolvedFileName)) {
				return i18n.t('validation.invalidCharacters', { filename: resolvedFileName });
			}

			// 템플릿 경로 검증
			if (templatePath && !isFileExists(this.plugin, templatePath)) {
				return i18n.t('validation.templateNotExists', { path: templatePath });
			}
		}

		if(cmd.type === CustomCommandType.JOURNAL){
			// Journal은 플러그인 설정에 의존하므로 별도 검증 불필요
			// isJournalAvailable()로 이미 체크됨
		}

		return null; // 유효함
	}
}
