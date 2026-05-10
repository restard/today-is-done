# Today's Done

A VS Code extension that automatically tracks work time per project in the background and lets you review your day at a glance.

```
──────────────────────────────
2026-05-10
Great work today!
──────────────────────────────

project-A

project-B
- Feat: implement navigation
- Fix: apply active UI correctly in nav

──────────────────────────────
Time breakdown
──────────────────────────────
- project-A           0h 19m
- project-B           0h 08m
──────────────────────────────
Total                  0h 30m
──────────────────────────────
```

---

## How it works

```
VS Code extension (vscode-time-tracker)
  └─ detects activity → writes to ~/.timetracker/log.json

today-watch (separate tool)
  └─ monitors Adobe / Figma / MS Office → writes to ~/.timetracker/apps-log.json

today-done CLI
  └─ reads both files and shows a unified summary
```

---

## Installation

### Requirements

- Node.js 22+
- pnpm 10+
- VS Code 1.80+

### VS Code Extension

```bash
code --install-extension vscode-today-is-done-0.1.0.vsix
```

After installation, restart VS Code. Tracking starts automatically and the current project with elapsed time appears in the status bar.

---

## Activity detection

The timer resets on any of the following actions (stops after `timeoutMinutes` of inactivity):

- Text editing
- Cursor movement, click, or selection
- Switching editor tabs
- Terminal activity (open or switch)
- Window focus

---

## Settings

| Setting                      | Description             | Default    |
| ---------------------------- | ----------------------- | ---------- |
| `timetracker.timeoutMinutes` | Idle timeout in minutes | `2`        |
| `timetracker.outputFormat`   | Output format           | `markdown` |

---

## Commands

Open the Command Palette (`Cmd+Shift+P`) and search for **Today's Done**:

| Command                            | Description                     |
| ---------------------------------- | ------------------------------- |
| `Today's Done: Open Panel`         | Open today's summary panel      |
| `Today's Done: Copy Today's Work`  | Copy today's work to clipboard  |
| `Today's Done: Copy Work by Date`  | Copy work for a specific date   |
| `Today's Done: Show Log`           | Show the last 7 days in a panel |
| `Today's Done: Reset Today's Data` | Delete today's tracked data     |

Click the status bar item to open the panel directly.

---

## Data format

`~/.timetracker/log.json` — records VS Code work time (in seconds) per project per day.

```json
{
  "2026-05-09": {
    "client-A-website": 5400,
    "client-B-lp": 3200
  }
}
```

---

## Development

### Repository structure

```
/
├── src/
│   ├── extension.ts    # entry point, command registration
│   ├── tracker.ts      # time tracking logic
│   ├── storage.ts      # log.json read/write
│   ├── statusbar.ts    # status bar display
│   ├── panel.ts        # Today's Done webview panel
│   ├── formatter.ts    # clipboard text formatting
│   └── git.ts          # git log retrieval
├── dist/               # compiled JS (auto-generated)
├── package.json
└── tsconfig.json
```

### Setup

```bash
pnpm install
```

### Development

```bash
pnpm run watch      # watch mode (auto-rebuild on file change)
pnpm run typecheck  # type check only
```

Press `F5` in VS Code to launch an Extension Development Host for live testing.

### Build & package

```bash
pnpm build          # production build
pnpm run package    # generate .vsix file
```

> First run of `pnpm run package` may require `pnpm approve-builds`.

Install the generated `.vsix` with `code --install-extension`.
