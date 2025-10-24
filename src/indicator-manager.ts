import { Workspace } from 'obsidian';
import { isWindowPinned } from './electron';
import type AlwaysOnTopPlugin from '../main';

type IndicatorMap = Map<Document, HTMLElement>;
type PinStateMap = Map<Document, boolean>;

export class IndicatorManager {
	private readonly pinIndicators: IndicatorMap = new Map();
	private readonly windowPinStates: PinStateMap = new Map();
	private updateInterval: number | null = null;

	constructor(
		private readonly plugin: AlwaysOnTopPlugin,
		private readonly onToggleRequested: () => void,
	) {}

	init(): void {
		this.addIndicatorsToAllWindows();
		this.updateInterval = window.setInterval(() => {
			this.updateAllIndicators();
		}, 500);
		this.plugin.registerInterval(this.updateInterval);
	}

	dispose(): void {
		this.removeAllIndicators();
		if (this.updateInterval !== null) {
			window.clearInterval(this.updateInterval);
			this.updateInterval = null;
		}
	}

	handleWindowOpened(doc: Document): void {
		this.addIndicatorToWindow(doc);
	}

	handleWindowClosed(doc: Document): void {
		this.removeIndicatorFromWindow(doc);
	}

	refreshIndicators(): void {
		this.removeAllIndicators();
		this.addIndicatorsToAllWindows();
	}

	setWindowPinned(doc: Document, isPinned: boolean): void {
		this.windowPinStates.set(doc, isPinned);
		this.updateIndicatorForWindow(doc);
	}

	getWindowPinState(doc: Document): boolean {
		return this.windowPinStates.get(doc) ?? false;
	}

	getFocusedDocument(): Document | null {
		if (document.hasFocus()) {
			return document;
		}

		for (const doc of this.pinIndicators.keys()) {
			if (doc.hasFocus()) {
				return doc;
			}
		}

		return null;
	}

	updateAllIndicators(): void {
		this.pinIndicators.forEach((_indicator, doc) => {
			this.updateIndicatorForWindow(doc);
		});
	}

	private addIndicatorsToAllWindows(): void {
		this.addIndicatorToWindow(document);

		const workspace: Workspace = this.plugin.app.workspace;
		workspace.iterateAllLeaves((leaf) => {
			const win = (leaf as any).view?.containerEl?.ownerDocument;
			if (win && win !== document) {
				this.addIndicatorToWindow(win);
			}
		});
	}

	private addIndicatorToWindow(doc: Document): void {
		if (this.pinIndicators.has(doc)) {
			return;
		}

		const isMainWindow = doc === document;

		if (isMainWindow) {
			if (!this.plugin.settings.showIndicatorInMainWindow) {
				return;
			}

			let isPinned = this.windowPinStates.get(doc) ?? false;
			if (doc.hasFocus()) {
				isPinned = isWindowPinned();
			}

			if (!isPinned) {
				return;
			}
		} else {
			if (!this.plugin.settings.showIndicatorInPopoutWindows) {
				return;
			}
		}

		const indicator = doc.body.createDiv('always-on-top-indicator');
		indicator.addClass(isMainWindow ? 'always-on-top-indicator--main' : 'always-on-top-indicator--popout');
		indicator.setAttribute('aria-label', 'Toggle always on top');
		indicator.innerHTML = `
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 17v5"/>
				<path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1v3.76"/>
			</svg>
		`;

		indicator.addEventListener('click', () => {
			if (doc.defaultView) {
				doc.defaultView.focus();
			}
			setTimeout(() => {
				this.onToggleRequested();
			}, 50);
		});

		this.pinIndicators.set(doc, indicator);
		this.applyIndicatorPosition(indicator, doc);
		this.updateIndicatorForWindow(doc);
	}

	private removeIndicatorFromWindow(doc: Document): void {
		const indicator = this.pinIndicators.get(doc);
		if (indicator) {
			indicator.remove();
			this.pinIndicators.delete(doc);
		}
		this.windowPinStates.delete(doc);
	}

	private removeAllIndicators(): void {
		this.pinIndicators.forEach((indicator) => indicator.remove());
		this.pinIndicators.clear();
		this.windowPinStates.clear();
	}

	private updateIndicatorForWindow(doc: Document): void {
		const isMainWindow = doc === document;
		let isPinned = this.windowPinStates.get(doc) ?? false;

		if (doc.hasFocus()) {
			isPinned = isWindowPinned();
			this.windowPinStates.set(doc, isPinned);
		}

		if (isMainWindow && this.plugin.settings.showIndicatorInMainWindow) {
			const indicator = this.pinIndicators.get(doc);

			if (isPinned && !indicator) {
				this.addIndicatorToWindow(doc);
			} else if (!isPinned && indicator) {
				this.removeIndicatorFromWindow(doc);
			}
		}

		const indicator = this.pinIndicators.get(doc);
		if (!indicator) {
			return;
		}

		this.applyIndicatorPosition(indicator, doc);

		if (isPinned) {
			indicator.addClass('is-pinned');
		} else {
			indicator.removeClass('is-pinned');
		}
	}

	private applyIndicatorPosition(indicator: HTMLElement, doc: Document): void {
		const offsets = this.getIndicatorOffsets(doc);
		indicator.style.top = `${offsets.top}px`;
		indicator.style.right = `${offsets.right}px`;
	}

	private getIndicatorOffsets(doc: Document) {
		const isMainWindow = doc === document;
		if (isMainWindow) {
			return {
				top: this.plugin.settings.mainIndicatorOffsetTop,
				right: this.plugin.settings.mainIndicatorOffsetRight,
			};
		}

		return {
			top: this.plugin.settings.popoutIndicatorOffsetTop,
			right: this.plugin.settings.popoutIndicatorOffsetRight,
		};
	}
}
