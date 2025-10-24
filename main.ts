import { Notice, Plugin, PluginSettingTab, Setting, WorkspaceWindow } from 'obsidian';
import { toggleAlwaysOnTop, isWindowPinned, AlwaysOnTopResult } from './src/electron';

interface AlwaysOnTopSettings {
	showIndicatorInMainWindow: boolean;
	showIndicatorInPopoutWindows: boolean;
}

const DEFAULT_SETTINGS: AlwaysOnTopSettings = {
	showIndicatorInMainWindow: false,
	showIndicatorInPopoutWindows: true
};

export default class AlwaysOnTopPlugin extends Plugin {
	settings: AlwaysOnTopSettings;
	private pinIndicators: Map<Document, HTMLElement> = new Map();
	private windowPinStates: Map<Document, boolean> = new Map();
	private updateInterval: number | null = null;

	async onload() {
		await this.loadSettings();

		// Add toggle command
		this.addCommand({
			id: 'toggle-window-pin',
			name: 'Toggle Window Pin for Always on Top',
			callback: () => this.togglePin(),
		});

		// Add settings tab
		this.addSettingTab(new AlwaysOnTopSettingTab(this.app, this));

		// Add pin indicators to all windows
		this.addPinIndicatorToAllWindows();

		// Listen for new windows
		this.registerEvent(
			this.app.workspace.on('window-open', (win: WorkspaceWindow) => {
				this.addPinIndicatorToWindow(win.doc);
			})
		);

		// Listen for window close
		this.registerEvent(
			this.app.workspace.on('window-close', (win: WorkspaceWindow) => {
				this.removePinIndicatorFromWindow(win.doc);
			})
		);

		// Poll for pin state changes (in case user uses command palette)
		this.updateInterval = window.setInterval(() => {
			this.updateAllIndicators();
		}, 500);
		this.registerInterval(this.updateInterval);
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		// Refresh all indicators when settings change
		this.removeAllPinIndicators();
		this.addPinIndicatorToAllWindows();
	}

	onunload() {
		this.removeAllPinIndicators();
		if (this.updateInterval !== null) {
			window.clearInterval(this.updateInterval);
		}
	}

	private togglePin() {
		const result = toggleAlwaysOnTop();
		this.showToggleNotice(result);
		
		// Update pin state for currently focused window
		const focusedDoc = this.getFocusedDocument();
		if (focusedDoc) {
			const isPinned = result === 'applied' || (result === 'already');
			this.windowPinStates.set(focusedDoc, isPinned);
			
			// For main window, we need to explicitly update since it might not be in the map
			if (focusedDoc === document) {
				this.updateIndicatorForWindow(focusedDoc);
			}
		}
		
		// Update all indicators immediately
		this.updateAllIndicators();
	}

	private getFocusedDocument(): Document | null {
		// Check main window
		if (document.hasFocus()) {
			return document;
		}
		
		// Check all popout windows
		for (const doc of this.pinIndicators.keys()) {
			if (doc.hasFocus()) {
				return doc;
			}
		}
		
		return null;
	}

	private addPinIndicatorToAllWindows() {
		// Add to main window
		this.addPinIndicatorToWindow(document);

		// Add to all pop-out windows
		const leaves = this.app.workspace.getLeavesOfType('empty');
		this.app.workspace.iterateAllLeaves((leaf) => {
			const win = (leaf as any).view?.containerEl?.ownerDocument;
			if (win && win !== document) {
				this.addPinIndicatorToWindow(win);
			}
		});
	}

	private addPinIndicatorToWindow(doc: Document) {
		// Check if indicator already exists
		if (this.pinIndicators.has(doc)) {
			return;
		}

		// Determine if this is the main window or popout
		const isMainWindow = doc === document;
		
		// Main window logic
		if (isMainWindow) {
			// Check settings first
			if (!this.settings.showIndicatorInMainWindow) {
				return; // Settings disabled, don't show indicator
			}
			// Then check if pinned (from state map or current state)
			let isPinned = this.windowPinStates.get(doc) ?? false;
			if (doc.hasFocus()) {
				isPinned = isWindowPinned();
			}
			if (!isPinned) {
				return; // Not pinned, don't show indicator
			}
		} else {
			// Popout window: check settings
			if (!this.settings.showIndicatorInPopoutWindows) {
				return; // Settings disabled, don't show indicator
			}
		}

		// Create pin indicator button in the top-right corner
		const indicator = doc.body.createDiv('always-on-top-indicator');
		indicator.setAttribute('aria-label', 'Toggle always on top');
		
		// Add icon
		indicator.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 17v5"/>
				<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76"/>
			</svg>
		`;

		// Add click handler - need to focus the window first
		indicator.addEventListener('click', () => {
			// Focus this window first
			if (doc.defaultView) {
				doc.defaultView.focus();
			}
			// Small delay to ensure window is focused
			setTimeout(() => {
				this.togglePin();
			}, 50);
		});

		// Store the indicator
		this.pinIndicators.set(doc, indicator);

		// Update its state
		this.updateIndicatorForWindow(doc);
	}

	private removePinIndicatorFromWindow(doc: Document) {
		const indicator = this.pinIndicators.get(doc);
		if (indicator) {
			indicator.remove();
			this.pinIndicators.delete(doc);
		}
		// Also clean up the pin state
		this.windowPinStates.delete(doc);
	}

	private removeAllPinIndicators() {
		this.pinIndicators.forEach((indicator) => {
			indicator.remove();
		});
		this.pinIndicators.clear();
		this.windowPinStates.clear();
	}

	private updateAllIndicators() {
		this.pinIndicators.forEach((indicator, doc) => {
			this.updateIndicatorForWindow(doc);
		});
	}

	private updateIndicatorForWindow(doc: Document) {
		const isMainWindow = doc === document;
		
		// Get pin state from our state map
		let isPinned = this.windowPinStates.get(doc) ?? false;
		
		// If this window is currently focused, update the state
		if (doc.hasFocus()) {
			isPinned = isWindowPinned();
			this.windowPinStates.set(doc, isPinned);
		}
		
		// For main window: show/hide based on pin state (if enabled in settings)
		if (isMainWindow && this.settings.showIndicatorInMainWindow) {
			const indicator = this.pinIndicators.get(doc);
			
			if (isPinned && !indicator) {
				// Need to show indicator
				this.addPinIndicatorToWindow(doc);
			} else if (!isPinned && indicator) {
				// Need to hide indicator
				this.removePinIndicatorFromWindow(doc);
			}
		}

		// Update indicator state
		const indicator = this.pinIndicators.get(doc);
		if (!indicator) return;

		if (isPinned) {
			indicator.addClass('is-pinned');
		} else {
			indicator.removeClass('is-pinned');
		}
	}

	private showToggleNotice(result: AlwaysOnTopResult) {
		switch (result) {
			case 'applied':
				new Notice('Window pinned on top');
				break;
			case 'removed':
				new Notice('Window unpinned');
				break;
			case 'unavailable':
			default:
				new Notice('Unable to control the window');
		}
	}
}

class AlwaysOnTopSettingTab extends PluginSettingTab {
	plugin: AlwaysOnTopPlugin;

	constructor(app: any, plugin: AlwaysOnTopPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		// Main Window section
		containerEl.createEl('h3', { text: 'Main Window' });
		
		containerEl.createEl('p', { 
			text: 'By default, the pin indicator appears only when the main window is pinned, and disappears when unpinned.',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
			.setName('Show pin indicator')
			.setDesc('When OFF: The pin indicator is completely hidden in the main window, even when pinned.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showIndicatorInMainWindow)
				.onChange(async (value) => {
					this.plugin.settings.showIndicatorInMainWindow = value;
					await this.plugin.saveSettings();
				}));

		// Pop-out Windows section
		containerEl.createEl('h3', { text: 'Pop-out Windows' });
		
		containerEl.createEl('p', { 
			text: 'By default, the pin indicator is always visible in pop-out windows (highlighted when pinned, gray when unpinned).',
			cls: 'setting-item-description'
		});

		new Setting(containerEl)
			.setName('Show pin indicator')
			.setDesc('When OFF: The pin indicator is completely hidden in pop-out windows.')
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showIndicatorInPopoutWindows)
				.onChange(async (value) => {
					this.plugin.settings.showIndicatorInPopoutWindows = value;
					await this.plugin.saveSettings();
				}));
	}
}
