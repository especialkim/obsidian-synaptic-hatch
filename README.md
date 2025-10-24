# Obsidian Always On Top

Pin Obsidian windows so they stay on top of other applications. Works with both main window and pop-out windows.

## Features

- 📌 **Toggle always-on-top** for any Obsidian window (main or pop-out)
- 🎯 **Visual indicator** in the top-right corner showing pin status
- ⌨️ **Keyboard command** to quickly toggle pin state
- 🖱️ **Click the pin icon** to toggle without using commands

## Installation

### From Obsidian Community Plugins (Coming Soon)
1. Open **Settings → Community plugins**
2. Search for "Always On Top"
3. Click **Install** and then **Enable**

### Manual Installation
1. Clone or download this repository to `<Vault>/.obsidian/plugins/obsidian-always-on-top`
2. Run `npm install` to install dependencies
3. Run `npm run build` to compile the plugin
4. Reload Obsidian and enable the plugin in **Settings → Community plugins**

## Usage

### Method 1: Pin Indicator (Recommended)
- Look for the **pin icon** in the top-right corner of any window
- Click the icon to toggle always-on-top
- Icon will be **highlighted** when the window is pinned

### Method 2: Command Palette
- Press `Cmd+P` (macOS) or `Ctrl+P` (Windows/Linux)
- Search for "Toggle window always on top"
- Press Enter to toggle

### Works with:
- Main Obsidian window
- Pop-out windows (right-click tab → "Move to new window")
- Multiple windows independently

## Development

```bash
# Install dependencies
npm install

# Build for production
npm run build

# Development mode with auto-rebuild
npm run dev
```

## Technical Details

- Uses Electron's `BrowserWindow` API
- Desktop-only (requires Electron)
- Automatically detects the focused window
- No configuration needed

## Limitations

- **Desktop only** - does not work on mobile (no Electron API available)
- Requires Obsidian to have access to Electron remote module

## License

MIT
