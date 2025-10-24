import { setWindowAlwaysOnTopById, getBrowserWindowById } from '../electron';
import { clearPopupDocumentMarker, getPopupDocumentWindowId } from './document-marker';
import type { PopoutLifecycleState } from './popout-manager';

interface CloseHandlerOptions {
	onCleanup: () => void;
	onResetState: () => void;
	onUnsetActiveWindow: () => void;
	onMaintainBackground: (mainWindowId: number) => void;
	onRestoreFocus: (windowId: number) => void;
}

export function handlePopoutClose(
	state: PopoutLifecycleState,
	doc: Document,
	options: CloseHandlerOptions,
): void {
	console.log('[AOT Close Handler] handlePopoutClose called');
	console.log('[AOT Close Handler] State:', {
		activePopupWindowId: state.activePopupWindowId,
		shouldMaintainBackground: state.activePopupShouldMaintainBackground,
		shouldRestoreFocus: state.activePopupRestoreFocus,
		mainWindowId: state.activePopupMainWindowId
	});
	
	const markerMatches =
		state.activePopupWindowId !== null && getPopupDocumentWindowId(doc) === state.activePopupWindowId;
	const docMatches = state.activePopupDoc !== null && doc === state.activePopupDoc;

	console.log('[AOT Close Handler] Match check:', { markerMatches, docMatches });

	if (!markerMatches && !docMatches) {
		console.log('[AOT Close Handler] Not a matching popup, ignoring');
		return;
	}

	options.onCleanup();

	if (markerMatches) {
		clearPopupDocumentMarker(doc);
	}

	const popupWindowId = state.activePopupWindowId;
	const shouldMaintainBackground = state.activePopupShouldMaintainBackground;
	const shouldRestoreFocus = state.activePopupRestoreFocus;
	const mainWindowId = state.activePopupMainWindowId;

	console.log('[AOT Close Handler] Captured state before reset:', {
		popupWindowId,
		shouldMaintainBackground,
		shouldRestoreFocus,
		mainWindowId
	});

	options.onUnsetActiveWindow();
	options.onResetState();

	if (popupWindowId !== null) {
		console.log('[AOT Close Handler] Removing always-on-top from popup:', popupWindowId);
		setWindowAlwaysOnTopById(popupWindowId, false, 'floating');
	}

	// Check the main window's CURRENT focus state (not the saved state)
	if (mainWindowId !== null) {
		const mainWindow = getBrowserWindowById(mainWindowId);
		const isMainWindowCurrentlyFocused = mainWindow && typeof mainWindow.isFocused === 'function' ? mainWindow.isFocused() : false;
		
		console.log('[AOT Close Handler] Main window current focus state:', isMainWindowCurrentlyFocused);
		console.log('[AOT Close Handler] Saved state - shouldMaintainBackground:', shouldMaintainBackground, 'shouldRestoreFocus:', shouldRestoreFocus);
		
		if (isMainWindowCurrentlyFocused) {
			// Main window is already focused - do nothing, keep it focused
			console.log('[AOT Close Handler] Main window is focused - keeping it focused (no action)');
		} else if (shouldRestoreFocus) {
			// Was supposed to restore focus but window is not focused - restore it
			console.log('[AOT Close Handler] Main window not focused but should restore - calling onRestoreFocus');
			options.onRestoreFocus(mainWindowId);
		} else {
			// Main window is not focused and should stay in background
			console.log('[AOT Close Handler] Main window not focused and should maintain background - calling onMaintainBackground');
			options.onMaintainBackground(mainWindowId);
		}
	} else {
		console.log('[AOT Close Handler] No main window ID - no focus action');
	}
}
