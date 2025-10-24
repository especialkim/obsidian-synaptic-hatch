interface ElectronBrowserWindow {
	setAlwaysOnTop(flag: boolean, level?: string): void;
	isAlwaysOnTop(): boolean;
	focus(): void;
	isFocused(): boolean;
	id: number;
}

interface ElectronRemoteModule {
	getCurrentWindow?(): ElectronBrowserWindow | null;
	BrowserWindow?: {
		getFocusedWindow(): ElectronBrowserWindow | null;
		getAllWindows(): ElectronBrowserWindow[];
	};
}

type ElectronModule = ElectronRemoteModule & {
	remote?: ElectronRemoteModule;
};

type ElectronRequire = (moduleId: string) => unknown;

const MODULE_IDS = ['@electron/remote', 'electron'] as const;

function getElectronRequire(): ElectronRequire | null {
	const globalWindow = window as Window & { 
		require?: ElectronRequire;
		electron?: unknown;
	};
	return globalWindow.require ?? null;
}

function resolveRemoteModule(moduleExport: unknown): ElectronRemoteModule | null {
	if (!moduleExport || typeof moduleExport !== 'object') {
		return null;
	}

	const candidate = moduleExport as ElectronModule;
	if (candidate.getCurrentWindow || candidate.BrowserWindow) {
		return candidate;
	}

	if (candidate.remote) {
		return candidate.remote;
	}

	return null;
}

export function getCurrentBrowserWindow(): ElectronBrowserWindow | null {
	let remoteModule: ElectronRemoteModule | null = null;

	// First try: window.electron.remote (direct access)
	const globalWindow = window as Window & {
		electron?: {
			remote?: ElectronRemoteModule;
		};
	};
	
	if (globalWindow.electron?.remote) {
		remoteModule = globalWindow.electron.remote;
	}

	// Second try: require('@electron/remote') or require('electron')
	if (!remoteModule) {
		const electronRequire = getElectronRequire();
		if (!electronRequire) {
			return null;
		}

		for (const moduleId of MODULE_IDS) {
			try {
				const moduleExport = electronRequire(moduleId);
				const resolved = resolveRemoteModule(moduleExport);
				if (resolved) {
					remoteModule = resolved;
					break;
				}
			} catch (error) {
				// Silently continue to next module
			}
		}
	}

	if (!remoteModule) {
		return null;
	}

	// Strategy 1: Get all windows and find the focused one
	if (remoteModule.BrowserWindow?.getAllWindows) {
		try {
			const allWindows = remoteModule.BrowserWindow.getAllWindows();
			
			for (const win of allWindows) {
				if (win.isFocused()) {
					return win;
				}
			}
		} catch (error) {
			// Continue to next strategy
		}
	}

	// Strategy 2: Use getFocusedWindow
	if (remoteModule.BrowserWindow?.getFocusedWindow) {
		try {
			const focusedWindow = remoteModule.BrowserWindow.getFocusedWindow();
			if (focusedWindow) {
				return focusedWindow;
			}
		} catch (error) {
			// Continue to next strategy
		}
	}

	// Strategy 3: Fallback to getCurrentWindow
	if (remoteModule.getCurrentWindow) {
		try {
			const currentWindow = remoteModule.getCurrentWindow();
			if (currentWindow) {
				return currentWindow;
			}
		} catch (error) {
			// No window available
		}
	}

	return null;
}

export type AlwaysOnTopResult = 'applied' | 'already' | 'removed' | 'unavailable';

export function ensureAlwaysOnTop(): AlwaysOnTopResult {
	const browserWindow = getCurrentBrowserWindow();
	if (!browserWindow) {
		return 'unavailable';
	}

	if (!browserWindow.isAlwaysOnTop()) {
		browserWindow.setAlwaysOnTop(true);
		browserWindow.focus();
		return 'applied';
	}

	browserWindow.focus();
	return 'already';
}

export function toggleAlwaysOnTop(): AlwaysOnTopResult {
	const browserWindow = getCurrentBrowserWindow();
	if (!browserWindow) {
		return 'unavailable';
	}

	const currentState = browserWindow.isAlwaysOnTop();
	browserWindow.setAlwaysOnTop(!currentState);
	browserWindow.focus();
	
	return currentState ? 'removed' : 'applied';
}

export function isWindowPinned(): boolean {
	const browserWindow = getCurrentBrowserWindow();
	if (!browserWindow) {
		return false;
	}
	
	return browserWindow.isAlwaysOnTop();
}
