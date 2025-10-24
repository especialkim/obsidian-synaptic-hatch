import { Notice, TFile, WorkspaceLeaf } from 'obsidian';
import {
	getCurrentBrowserWindow,
	getBrowserWindowIds,
	setWindowAlwaysOnTopById,
	focusWindowById,
	blurCurrentWindow,
	blurWindowById,
} from '../electron';
import type AlwaysOnTopPlugin from '../../main';
import type { IndicatorManager } from '../indicator-manager';
import { markPopupDocument } from './document-marker';
import { handlePopoutClose } from './popout-close-handler';

export interface PendingPopupInfo {
	existingWindowIds: Set<number>;
	shouldMaintainBackground: boolean;
	restoreFocus: boolean;
	mainWindowId: number;
}

export interface PopoutLifecycleState {
	pendingPopupInfo: PendingPopupInfo | null;
	pendingPopupFinalizeTimeout: number | null;
	activePopupWindowId: number | null;
	activePopupDoc: Document | null;
	activePopupShouldMaintainBackground: boolean;
	activePopupRestoreFocus: boolean;
	activePopupMainWindowId: number | null;
}

const FINALIZE_MAX_ATTEMPTS = 10;
const FINALIZE_RETRY_DELAY = 75;

export class PopoutManager {
	private readonly state: PopoutLifecycleState = {
		pendingPopupInfo: null,
		pendingPopupFinalizeTimeout: null,
		activePopupWindowId: null,
		activePopupDoc: null,
		activePopupShouldMaintainBackground: false,
		activePopupRestoreFocus: false,
		activePopupMainWindowId: null,
	};

	constructor(
		private readonly plugin: AlwaysOnTopPlugin,
		private readonly indicators: IndicatorManager,
	) {}

	openPopout(forceBackground: boolean = false): void {
		console.log('[AOT Popout] openPopout called, forceBackground:', forceBackground);
		
		if (this.state.pendingPopupInfo) {
			console.log('[AOT Popout] Already pending popup, ignoring');
			return;
		}

		if (this.state.activePopupWindowId) {
			console.log('[AOT Popout] Reactivating existing popup:', this.state.activePopupWindowId);
			
			const currentWindow = getCurrentBrowserWindow();
			const windowIsFocused = currentWindow && typeof currentWindow.isFocused === 'function' ? currentWindow.isFocused() : document.hasFocus();
			console.log('[AOT Popout] Main window is currently focused (reactivate):', windowIsFocused);
			
			this.state.activePopupShouldMaintainBackground = forceBackground || !windowIsFocused;
			this.state.activePopupRestoreFocus = !forceBackground && windowIsFocused;
			
			if (forceBackground || !windowIsFocused) {
				blurCurrentWindow();
				console.log('[AOT Popout] Main window blurred for reactivation');
			} else {
				console.log('[AOT Popout] Main window kept focused for reactivation');
			}
			
			setWindowAlwaysOnTopById(this.state.activePopupWindowId, true, 'floating');
			focusWindowById(this.state.activePopupWindowId);
			
			return;
		}

		const currentWindow = getCurrentBrowserWindow();
		if (!currentWindow) {
			new Notice('Unable to control windows on this platform.');
			return;
		}

		console.log('[AOT Popout] Creating new popup, main window ID:', currentWindow.id);
		
		const windowIsFocused = typeof currentWindow.isFocused === 'function' ? currentWindow.isFocused() : document.hasFocus();
		console.log('[AOT Popout] Main window is currently focused:', windowIsFocused);
		
		const shouldMaintainBackground = forceBackground || !windowIsFocused;
		const shouldRestoreFocus = !forceBackground && windowIsFocused;

		const existingWindowIds = new Set(getBrowserWindowIds());
		existingWindowIds.add(currentWindow.id);

		this.state.pendingPopupInfo = {
			existingWindowIds,
			shouldMaintainBackground,
			restoreFocus: shouldRestoreFocus,
			mainWindowId: currentWindow.id,
		};

		if (shouldMaintainBackground) {
			blurCurrentWindow();
			console.log('[AOT Popout] Main window blurred (forceBackground:', forceBackground, ', focused:', windowIsFocused, ')');
		} else {
			console.log('[AOT Popout] Main window kept focused (focused:', windowIsFocused, ')');
		}

		/* Blank Tab 으로 열기 */
		// this.plugin.app.workspace.openPopoutLeaf();

		/* Focused Tab 을 새 창으로 열기 */
		const popoutLeaf: WorkspaceLeaf = this.plugin.app.workspace.openPopoutLeaf();
		const activeFile: TFile | null = this.plugin.app.workspace.getActiveFile();
		if (activeFile) {
			popoutLeaf.openFile(activeFile).catch((error) => {
				console.error('Always On Top plugin: failed to open file in pop-out window.', error);
			});
		}
	}

	handleWindowOpened(doc: Document): void {
		if (!this.state.pendingPopupInfo) {
			return;
		}

		this.clearPendingPopupTimeout();
		this.finalizePendingPopout(doc);
	}

	handleWindowClosed(doc: Document): void {
		console.log('[AOT Popout] handleWindowClosed called');
		
		handlePopoutClose(this.state, doc, {
			onCleanup: () => {
				console.log('[AOT Popout] Cleanup callback');
				this.clearPendingPopupTimeout();
				this.state.activePopupDoc = null;
				this.state.pendingPopupInfo = null;
			},
			onResetState: () => {
				console.log('[AOT Popout] Reset state callback');
				this.state.activePopupShouldMaintainBackground = false;
				this.state.activePopupRestoreFocus = false;
				this.state.activePopupMainWindowId = null;
			},
			onUnsetActiveWindow: () => {
				console.log('[AOT Popout] Unset active window callback');
				this.state.activePopupWindowId = null;
			},
			onMaintainBackground: (mainWindowId: number) => {
				console.log('[AOT Popout] Maintain background - blurring main window ID:', mainWindowId);
				// Blur immediately and at multiple intervals to prevent Obsidian from focusing main window
				blurWindowById(mainWindowId);
				window.setTimeout(() => {
					console.log('[AOT Popout] Blur attempt 1 (10ms)');
					blurWindowById(mainWindowId);
				}, 10);
				window.setTimeout(() => {
					console.log('[AOT Popout] Blur attempt 2 (30ms)');
					blurWindowById(mainWindowId);
				}, 30);
				window.setTimeout(() => {
					console.log('[AOT Popout] Blur attempt 3 (50ms)');
					blurWindowById(mainWindowId);
				}, 50);
				window.setTimeout(() => {
					console.log('[AOT Popout] Blur attempt 4 (100ms)');
					blurWindowById(mainWindowId);
				}, 100);
			},
			onRestoreFocus: (windowId) => {
				console.log('[AOT Popout] Restore focus to window:', windowId);
				window.setTimeout(() => {
					focusWindowById(windowId);
				}, 50);
			},
		});
	}

	dispose(): void {
		this.clearPendingPopupTimeout();
	}

	getActivePopupWindowId(): number | null {
		return this.state.activePopupWindowId;
	}

	isMaintainingBackground(): boolean {
		return this.state.activePopupShouldMaintainBackground;
	}

	setMaintainBackground(value: boolean): void {
		this.state.activePopupShouldMaintainBackground = value;
	}

	setRestoreFocus(value: boolean): void {
		this.state.activePopupRestoreFocus = value;
	}

	private finalizePendingPopout(doc: Document, attempt = 0): void {
		if (!this.state.pendingPopupInfo) {
			console.log('[AOT Popout] finalizePendingPopout: no pending info');
			return;
		}

		const newWindowId = this.findNewBrowserWindowId(this.state.pendingPopupInfo.existingWindowIds);
		if (!newWindowId) {
			if (attempt >= FINALIZE_MAX_ATTEMPTS) {
				console.log('[AOT Popout] finalizePendingPopout: max attempts reached, giving up');
				this.state.pendingPopupInfo = null;
				this.state.pendingPopupFinalizeTimeout = null;
				return;
			}

			console.log('[AOT Popout] finalizePendingPopout: window not found yet, retrying...', attempt);
			this.state.pendingPopupFinalizeTimeout = window.setTimeout(() => {
				this.finalizePendingPopout(doc, attempt + 1);
			}, FINALIZE_RETRY_DELAY);
			return;
		}

		console.log('[AOT Popout] finalizePendingPopout: Found new popup window ID:', newWindowId);
		
		const { shouldMaintainBackground, restoreFocus, mainWindowId } = this.state.pendingPopupInfo;
		console.log('[AOT Popout] finalizePendingPopout: State:', { 
			shouldMaintainBackground, 
			restoreFocus, 
			mainWindowId 
		});
		
		this.state.pendingPopupInfo = null;
		this.state.pendingPopupFinalizeTimeout = null;
		this.state.activePopupWindowId = newWindowId;
		this.state.activePopupDoc = doc;
		this.state.activePopupShouldMaintainBackground = shouldMaintainBackground;
		this.state.activePopupRestoreFocus = restoreFocus;
		this.state.activePopupMainWindowId = mainWindowId;

		markPopupDocument(doc, newWindowId);

		console.log('[AOT Popout] Setting popup always on top and focusing');
		setWindowAlwaysOnTopById(newWindowId, true, 'floating');
		focusWindowById(newWindowId);
		
		this.indicators.setWindowPinned(doc, true);
		this.indicators.updateAllIndicators();
	}

	private clearPendingPopupTimeout(): void {
		if (this.state.pendingPopupFinalizeTimeout !== null) {
			window.clearTimeout(this.state.pendingPopupFinalizeTimeout);
			this.state.pendingPopupFinalizeTimeout = null;
		}
	}

	private findNewBrowserWindowId(existingWindowIds: Set<number>): number | null {
		const currentIds = getBrowserWindowIds();
		for (const id of currentIds) {
			if (!existingWindowIds.has(id)) {
				return id;
			}
		}
		return null;
	}
}
