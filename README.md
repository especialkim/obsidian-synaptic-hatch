> Korean version: [README_KO.md](README_KO.md)

# Synaptic Hatch

**A little portal that keeps the note you need right on top.**  
Synaptic Hatch lets any Obsidian window float above the rest, so you can jot thoughts, consult references, or run meetings without shuffling windows. Keep your favorite note in sight while you code, browse, or present.

> ⚠️ **Desktop only.** The plugin relies on Electron window controls and works on Windows, macOS, and Linux.

---

## ✨ Who Is It For?

**Light users**
- Hold meeting notes in view during calls.
- Pin a reference document over other apps.
- Park a vault dashboard on your second monitor.

**Power users**
- Trigger project dashboards from Raycast or Alfred.
- Open today’s daily note with a single hotkey every morning.
- Spin up dedicated quick-note popouts for each project.

---

## 🎯 Key Features

### Core
- **Toggle window pin:** Flip the active Obsidian window between Always-on-Top and normal with one command or hotkey.
- **Instant popout:** Lift the current tab into its own Always-on-Top window on demand.
- **Background mode:** Push the main window to the back while keeping the popout focused.
- **Pin indicator:** A small pin icon (📌) shows which windows are currently pinned; position and size are configurable.

### For power users
- **Custom popout commands:** Create commands that open specific files, spawn fresh notes in folders, or launch periodic journals.
- **Obsidian URI support:** Invoke popouts from automation tools with `obsidian://custom-popout` links.
- **Periodic note integration:** Works with Daily Notes, Calendar (weekly), Periodic Notes, and similar workflows.

---

## 🚀 Quick Start

### Step 1 — Learn the basics

#### Pin the current window
1. Press `Ctrl/Cmd + P` to open the command palette.
2. Run **“Toggle window pin.”**
3. The window jumps to Always-on-Top (run again to unpin).

**Or** click the 📌 indicator in the top-right corner (when enabled) to toggle pinning.

#### Pop out the active note
1. Press `Ctrl/Cmd + P`.
2. Run **“Open in new Always-on-Top popout window.”**
3. The current note appears in a popout that stays above other apps.

> 💡 **Tip:** Assign hotkeys under **Settings → Hotkeys** so your go-to commands are always one keystroke away.

---

### Step 2 — Build your own popouts (optional)

Custom commands are where Synaptic Hatch shines. Tailor them to your workflow.

#### Open settings
1. Go to **Settings → Community plugins → Synaptic Hatch**.
2. Toggle **Custom popout commands** on.
3. Click **+ Add command**.

#### Choose a command type

| Type | When to use it | Example settings |
| :--- | :--- | :--- |
| **📄 File** | Always open the same note, e.g., project dashboard or inbox | File path: `Projects/Inbox.md` |
| **📁 Folder** | Spin up new notes on the fly, e.g., meeting logs or daily scratch pads | Folder: `Meeting Notes`<br/>Filename rule: `{{date}}_meeting`<br/>Template: `Templates/meeting.md` (optional) |
| **📅 Journal** | Launch daily/weekly/monthly/quarterly/yearly notes | Granularity: choose from what’s configured in Daily Notes / Calendar / Periodic Notes |
| **📋 Blank** | Need a clean scratch popout for ad-hoc notes | No extra settings required |

#### Activate the command
1. Fill in the fields for your command type.
2. Flip the **Enable** toggle on the right.
3. The command now appears in the palette as **“Custom Popout: …”**

---

### Step 3 — Integrate with your tools

#### Copy the URI
1. Click the **🔗 Copy URI** button next to an enabled command.
2. Save the `obsidian://custom-popout?vault=...` link.

#### Examples

**Raycast (macOS)**
```
1. Open Raycast → search “Quicklinks”.
2. Create a new Quicklink.
3. Name: “Work Daily Note”.
4. Link: paste the copied URI.
5. Invoke the Quicklink to open the popout instantly.
```

**Alfred (macOS)**
```
1. Create a blank Workflow.
2. Add a Hotkey trigger (e.g., Cmd+Shift+Space).
3. Connect it to an “Open URL” action with the copied URI.
4. Hit the hotkey to summon your note.
```

**Stream Deck / system-wide shortcuts**
- Map the URI to a button or hotkey for one-tap popouts.

---

## ⚙️ Settings Overview

### Indicators
Two toggles control the indicator on the main window and popout windows separately. For each, you can tweak:
- **Top offset** (px)
- **Right offset** (px)
- **Indicator size** (px)
- **Icon size** (px)

> 💡 If the indicator overlaps other buttons, adjust the offsets until it sits comfortably.

### Date format
Controls how `{{date}}` is expanded when creating files from folder commands.  
Default: `YYYY-MM-DD` → produces `2024-03-15`.  
Examples:
- `YYYY년 MM월 DD일` → `2024년 03월 15일`
- `YYYYMMDD_HHmmss` → `20240315_143022`

---

## 💡 Workflow Ideas

- **Dual monitors:** Park reference notes on a secondary display while drafting on the main screen.
- **Meetings & classes:** Keep note-taking in front while video calls stay behind the popout.
- **Writing & research:** Pop out multiple source notes and keep the editor clean.
- **Morning routine:** Create a custom journal command, copy its URI, and trigger it with your startup automation.
- **Project quick notes:** Assign shortcut keys to project-specific popouts for frictionless capture.

---

## 🔧 Troubleshooting

| Symptom | Fix |
| --- | --- |
| Window doesn’t stay pinned | Another app may override Always-on-Top. Restart Obsidian or test with a simpler setup. |
| Popout closes immediately | Requires Obsidian 0.15.0 or later. Update if needed. |
| Custom command missing | Ensure the command is enabled, all required fields are valid, and filenames avoid forbidden characters `/ \ : * ? " < > |`. |
| URI fails | Vault names containing spaces or non-Latin characters are auto-encoded. Don’t edit the URI manually. |
| Indicator overlaps UI | Adjust the offset sliders in settings until it clears surrounding buttons. |

---

## 📚 FAQ

### How do I enter file paths?
Use vault-relative paths, e.g., `Projects/Work/Dashboard.md`. Folder fields support auto-complete when you start typing.

### What does `{{date}}` do?
In folder commands, `{{date}}` is replaced with the current date formatted per your settings.  
Example: `{{date}}_meeting` → `2024-03-15_meeting.md`.

### When can I use the journal type?
Whenever Obsidian’s **Daily Notes** core plugin, the **Calendar** community plugin (weekly), **Periodic Notes**, or similar periodic-note providers are active. Only the granularities that are configured in those plugins will appear.

---

## 📦 Installation

### (Pending approval) Community plugin store
1. Open **Settings → Community plugins**.
2. Disable Safe mode (first time only).
3. Click **Browse**.
4. Search for **“Synaptic Hatch.”**
5. Install and enable the plugin.

### Manual install
1. Go to the GitHub repository  
   https://github.com/especialkim/obsidian-synaptic-hatch
2. Open the **Releases** tab and download the latest ZIP file
3. Unzip and place the folder in your Obsidian plugins `<vault>/.obsidian/plugins/`
4. Restart Obsidian and enable **Synaptic Hatch** in plugin settings

---

## 🤝 Contributing

Found a bug or have an idea?  
- File an issue on GitHub.  
- Suggestions and feedback are always welcome!

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

## 👨‍💻 About the Developer

- **Developer:** Yongmini  
- **Contact:** https://x.com/Facilitate4U

---

May Synaptic Hatch become the perfect portal for your ideas. 🚀
