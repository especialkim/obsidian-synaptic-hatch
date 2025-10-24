type PopupDocument = Document & {
	__alwaysOnTopPopupWindowId?: number;
};

export function markPopupDocument(doc: Document, windowId: number) {
	(doc as PopupDocument).__alwaysOnTopPopupWindowId = windowId;
}

export function getPopupDocumentWindowId(doc: Document): number | undefined {
	return (doc as PopupDocument).__alwaysOnTopPopupWindowId;
}

export function clearPopupDocumentMarker(doc: Document) {
	delete (doc as PopupDocument).__alwaysOnTopPopupWindowId;
}
