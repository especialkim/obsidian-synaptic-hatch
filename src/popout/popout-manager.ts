import { Notice, TFile, WorkspaceLeaf } from 'obsidian';
import {
	getCurrentBrowserWindow,
	getBrowserWindowIds,
	setWindowAlwaysOnTopById,
	focusWindowById,
	blurCurrentWindow,
	blurWindowById,
	getBrowserWindowById,
} from '../electron';
import type AlwaysOnTopPlugin from '../../main';
import type { IndicatorManager } from '../indicator-manager';
import { markPopupDocument } from './document-marker';
import { CustomPopoutCommand } from 'src/settings';
import { createJournalNote } from '../utils/journalUtils';


export interface PendingPopupInfo {
	existingWindowIds: Set<number>;
	shouldMaintainBackground: boolean;
	restoreFocus: boolean;
	mainWindowId: number;
}

export interface ActivePopupInfo {
	windowId: number;
	doc: Document;
	shouldMaintainBackground: boolean;
	restoreFocus: boolean;
	mainWindowId: number;
}

export interface PopoutLifecycleState {
	pendingPopupInfo: PendingPopupInfo | null;
	pendingPopupFinalizeTimeout: number | null;
	activePopups: Map<number, ActivePopupInfo>;
}

const FINALIZE_MAX_ATTEMPTS = 10;
const FINALIZE_RETRY_DELAY = 75;

export class PopoutManager {
	private readonly state: PopoutLifecycleState = {
		pendingPopupInfo: null,
		pendingPopupFinalizeTimeout: null,
		activePopups: new Map(),
	};
	private mainWindowId: number | null = null;

	constructor(
		private readonly plugin: AlwaysOnTopPlugin,
		private readonly indicators: IndicatorManager,
	) {
		// 초기화 시 메인창 ID 저장
		const mainWindow = getCurrentBrowserWindow();
		if (mainWindow) {
			this.mainWindowId = mainWindow.id;
		}
	}

	async openPopout(forceBackground: boolean = false, cmd? : CustomPopoutCommand): Promise<void> {
		
		if (this.state.pendingPopupInfo) {
			return;
		}

		const mainWindowIdToUse = this.mainWindowId;
		if (!mainWindowIdToUse) {
			new Notice('Unable to control windows on this platform.');
			return;
		}

		const mainWindow = getBrowserWindowById(mainWindowIdToUse);
		const windowIsFocused = mainWindow && typeof mainWindow.isFocused === 'function' ? mainWindow.isFocused() : document.hasFocus();
		
		const shouldMaintainBackground = forceBackground || !windowIsFocused;
		const shouldRestoreFocus = !forceBackground && windowIsFocused;

		const existingWindowIds = new Set(getBrowserWindowIds());

		this.state.pendingPopupInfo = {
			existingWindowIds,
			shouldMaintainBackground,
			restoreFocus: shouldRestoreFocus,
			mainWindowId: mainWindowIdToUse,
		};

		if (shouldMaintainBackground) {
			blurCurrentWindow();
		} else {
		}

		if(!cmd){
			const popoutLeaf: WorkspaceLeaf = this.plugin.app.workspace.openPopoutLeaf();
			const activeFile: TFile | null = this.plugin.app.workspace.getActiveFile();
			if (activeFile) {
				popoutLeaf.openFile(activeFile).catch((error) => {
					console.error('Always On Top plugin: failed to open file in pop-out window.', error);
				});
			}
			return;
		}

		if(cmd.type === 'file'){
			const popoutLeaf = this.plugin.app.workspace.openPopoutLeaf();
			const file = this.plugin.app.vault.getAbstractFileByPath(cmd.config.filePath || '');
			if(file instanceof TFile){
				popoutLeaf.openFile(file).catch((error) => {
					console.error('Always On Top plugin: failed to open file in pop-out window.', error);
				});
			}
			return;
		}

		if(cmd.type === 'blank'){
			console.log('blank', cmd);
			this.plugin.app.workspace.openPopoutLeaf();
			return;
		}

		if(cmd.type === 'journal'){
			const granularity = cmd.config.journalPeriod || 'daily';
			
			try {
				const journalFile = await createJournalNote(granularity);
				if (journalFile) {
					const popoutLeaf = this.plugin.app.workspace.openPopoutLeaf();
					popoutLeaf.openFile(journalFile).catch((error) => {
						console.error('Always On Top plugin: failed to open journal note in pop-out window.', error);
					});
				} else {
					new Notice(`Failed to create ${granularity} journal note.`);
				}
			} catch (error) {
				console.error('Always On Top plugin: error creating journal note:', error);
				new Notice(`Error creating ${granularity} journal note.`);
			}
			return;
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
		let closingPopupInfo: ActivePopupInfo | null = null;
		for (const [windowId, info] of this.state.activePopups.entries()) {
			if (info.doc === doc) {
				closingPopupInfo = info;
				break;
			}
		}
		
		if (!closingPopupInfo) {
			return;
		}
		
		// 팝업 제거
		this.state.activePopups.delete(closingPopupInfo.windowId);
		
		// Always-on-top 해제
		setWindowAlwaysOnTopById(closingPopupInfo.windowId, false, 'floating');
		
		// 다른 팝업이 남아있는지 확인
		const hasRemainingPopups = this.state.activePopups.size > 0;

		const mainWindowId = closingPopupInfo.mainWindowId;
		
		if (hasRemainingPopups) {
			blurWindowById(mainWindowId);
			window.setTimeout(() => blurWindowById(mainWindowId), 20);
			window.setTimeout(() => blurWindowById(mainWindowId), 100);
			return;
		}
		
		// 마지막 팝업이 닫힌 경우
		const mainWindow = getBrowserWindowById(mainWindowId);
		const isMainWindowCurrentlyFocused = mainWindow && typeof mainWindow.isFocused === 'function' ? mainWindow.isFocused() : false;
		
		if (isMainWindowCurrentlyFocused) {
			return;
		}
		
		blurWindowById(mainWindowId);
		window.setTimeout(() => blurWindowById(mainWindowId), 20);
		window.setTimeout(() => blurWindowById(mainWindowId), 100);
	}

	dispose(): void {
		this.clearPendingPopupTimeout();
		this.state.activePopups.clear();
	}

	getActivePopupWindowId(): number | null {
		// 첫 번째 활성 팝업 반환 (호환성 유지용)
		const firstPopup = this.state.activePopups.values().next().value;
		return firstPopup ? firstPopup.windowId : null;
	}

	getActivePopupCount(): number {
		return this.state.activePopups.size;
	}

	isMaintainingBackground(): boolean {
		// 모든 팝업이 background 유지 중인지 확인
		for (const popup of this.state.activePopups.values()) {
			if (popup.shouldMaintainBackground) {
				return true;
			}
		}
		return false;
	}

	private finalizePendingPopout(doc: Document, attempt = 0): void {
		if (!this.state.pendingPopupInfo) {
			return;
		}

		const newWindowId = this.findNewBrowserWindowId(this.state.pendingPopupInfo.existingWindowIds);
		if (!newWindowId) {
			if (attempt >= FINALIZE_MAX_ATTEMPTS) {
				this.state.pendingPopupInfo = null;
				this.state.pendingPopupFinalizeTimeout = null;
				return;
			}

			this.state.pendingPopupFinalizeTimeout = window.setTimeout(() => {
				this.finalizePendingPopout(doc, attempt + 1);
			}, FINALIZE_RETRY_DELAY);
			return;
		}

		
		const { shouldMaintainBackground, restoreFocus, mainWindowId } = this.state.pendingPopupInfo;															

		// 새로운 팝업 정보를 Map에 저장
		const popupInfo: ActivePopupInfo = {
			windowId: newWindowId,
			doc: doc,
			shouldMaintainBackground,
			restoreFocus,
			mainWindowId,
		};
		this.state.activePopups.set(newWindowId, popupInfo);
		
		this.state.pendingPopupInfo = null;
		this.state.pendingPopupFinalizeTimeout = null;

		markPopupDocument(doc, newWindowId);

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
