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
		} catch {
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
		} catch {
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
		} catch {
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
		} catch {
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
	} catch {
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
	} catch {
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
	} catch {
		return false;
	}
}

export function focusWindowById(id: number): boolean {
	const win = getBrowserWindowById(id);
	if (!win) {
		return false;
	}

	try {
		win.focus();
		return true;
	} catch {
		return false;
	}
}

export function blurCurrentWindow(): boolean {
	const win = getCurrentBrowserWindow();
	if (!win) {
		return false;
	}
	
	if (!win.blur) {
		return false;
	}

	try {
		win.blur();
		return true;
	} catch {
		return false;
	}
}

export function blurWindowById(id: number): boolean {
	const win = getBrowserWindowById(id);
	if (!win) {
		return false;
	}
	
	if (!win.blur) {
		return false;
	}

	try {
		win.blur();
		return true;
	} catch {
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
