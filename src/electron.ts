interface ElectronBrowserWindow {
	setAlwaysOnTop(flag: boolean, level?: string): void;
	isAlwaysOnTop(): boolean;
	focus(): void;
	isFocused(): boolean;
	blur?: () => void;
	setSkipTaskbar?: (skip: boolean) => void;
	id: number;
}

interface ElectronRemoteModule {
	getCurrentWindow?(): ElectronBrowserWindow | null;
	BrowserWindow?: {
		getFocusedWindow(): ElectronBrowserWindow | null;
		getAllWindows(): ElectronBrowserWindow[];
		fromId?(id: number): ElectronBrowserWindow | null;
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
	const remoteModule = getElectronRemoteModule();
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

function getElectronRemoteModule(): ElectronRemoteModule | null {
	const globalWindow = window as Window & {
		electron?: {
			remote?: ElectronRemoteModule;
		};
	};
	
	if (globalWindow.electron?.remote) {
		return globalWindow.electron.remote;
	}

	const electronRequire = getElectronRequire();
	if (!electronRequire) {
		return null;
	}

	for (const moduleId of MODULE_IDS) {
		try {
			const moduleExport = electronRequire(moduleId);
			const resolved = resolveRemoteModule(moduleExport);
			if (resolved) {
				return resolved;
			}
		} catch (error) {
			// Continue to next module
		}
	}

	return null;
}

export function getAllBrowserWindows(): ElectronBrowserWindow[] {
	const remoteModule = getElectronRemoteModule();
	if (!remoteModule?.BrowserWindow?.getAllWindows) {
		return [];
	}

	try {
		return remoteModule.BrowserWindow.getAllWindows();
	} catch (error) {
		return [];
	}
}

export function getBrowserWindowIds(): number[] {
	return getAllBrowserWindows().map((win) => win.id);
}

export function getBrowserWindowById(id: number): ElectronBrowserWindow | null {
	const remoteModule = getElectronRemoteModule();
	if (!remoteModule?.BrowserWindow?.fromId) {
		return null;
	}

	try {
		return remoteModule.BrowserWindow.fromId(id) ?? null;
	} catch (error) {
		return null;
	}
}

export function setWindowAlwaysOnTopById(id: number, flag: boolean, level: string = 'floating'): boolean {
	const win = getBrowserWindowById(id);
	if (!win) {
		return false;
	}

	try {
		win.setAlwaysOnTop(flag, level);
		return true;
	} catch (error) {
		return false;
	}
}

export function focusWindowById(id: number): boolean {
	console.log('[AOT Electron] focusWindowById called for window:', id);
	const win = getBrowserWindowById(id);
	if (!win) {
		console.log('[AOT Electron] Window not found:', id);
		return false;
	}

	try {
		win.focus();
		console.log('[AOT Electron] Window focused successfully:', id);
		return true;
	} catch (error) {
		console.log('[AOT Electron] Failed to focus window:', id, error);
		return false;
	}
}

export function blurCurrentWindow(): boolean {
	const win = getCurrentBrowserWindow();
	if (!win) {
		console.log('[AOT Electron] blurCurrentWindow: no window found');
		return false;
	}
	
	if (!win.blur) {
		console.log('[AOT Electron] blurCurrentWindow: blur method not available on window:', win.id);
		return false;
	}

	try {
		console.log('[AOT Electron] Blurring window:', win.id);
		win.blur();
		console.log('[AOT Electron] Window blurred successfully:', win.id);
		return true;
	} catch (error) {
		console.log('[AOT Electron] Failed to blur window:', win.id, error);
		return false;
	}
}

export function blurWindowById(id: number): boolean {
	console.log('[AOT Electron] blurWindowById called for window:', id);
	const win = getBrowserWindowById(id);
	if (!win) {
		console.log('[AOT Electron] Window not found:', id);
		return false;
	}
	
	if (!win.blur) {
		console.log('[AOT Electron] blurWindowById: blur method not available on window:', id);
		return false;
	}

	try {
		win.blur();
		console.log('[AOT Electron] Window blurred successfully:', id);
		return true;
	} catch (error) {
		console.log('[AOT Electron] Failed to blur window:', id, error);
		return false;
	}
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
