import * as vscode from 'vscode';
import { Storage, DayRecord } from './storage';
import { getCommits, resolveRepoPath } from './git';
import { formatDay } from './formatter';
import { todayString } from './tracker';

let currentPanel: vscode.WebviewPanel | undefined;

export async function showTodayPanel(
  context: vscode.ExtensionContext,
  storage: Storage
): Promise<void> {
  if (currentPanel) {
    currentPanel.reveal();
    return;
  }

  const panel = vscode.window.createWebviewPanel(
    'todayDone',
    "Today's Done",
    vscode.ViewColumn.Beside,
    { enableScripts: true }
  );
  currentPanel = panel;

  panel.onDidDispose(() => {
    currentPanel = undefined;
  }, undefined, context.subscriptions);

  const today = todayString();
  const record = storage.load()[today] ?? {};

  panel.webview.html = getWebviewContent(today, record);

  panel.webview.onDidReceiveMessage(async (message) => {
    if (message.command === 'copy') {
      const text = formatDay(today, record);
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('Copied to clipboard!');
    }
  }, undefined, context.subscriptions);
}

function hm(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function formatDate(date: string): string {
  const locale = vscode.env.language;
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getWebviewContent(date: string, record: DayRecord): string {
  const entries = Object.entries(record)
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, s]) => sum + s, 0);

  const projectsHtml = entries.length === 0
    ? '<div class="no-data">No activity recorded today yet.</div>'
    : entries.map(([project, seconds]) => {
        const repoPath = resolveRepoPath(project);
        const commits = repoPath ? getCommits(repoPath, date) : [];
        const commitsHtml = commits.length > 0
          ? commits.map(c => `<div class="commit">• ${escHtml(c)}</div>`).join('')
          : '<div class="commit no-commits">No commits</div>';
        return `
      <div class="project">
        <div class="project-header">
          <span>${escHtml(project)}</span>
          <span>${hm(seconds)}</span>
        </div>
        ${commitsHtml}
      </div>`;
      }).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: var(--vscode-font-family);
      color: var(--vscode-foreground);
      background: var(--vscode-editor-background);
      padding: 24px;
      line-height: 1.6;
    }
    .date { opacity: 0.5; margin-bottom: 24px; }
    .project { margin-bottom: 20px; }
    .project-header {
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }
    .commit { opacity: 0.7; font-size: 0.9em; padding-left: 12px; }
    .no-commits { font-style: italic; }
    .no-data { opacity: 0.5; font-style: italic; }
    .total {
      border-top: 1px solid var(--vscode-panel-border);
      margin-top: 24px;
      padding-top: 16px;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
    }
    button {
      margin-top: 24px;
      width: 100%;
      padding: 8px;
      background: var(--vscode-button-background);
      color: var(--vscode-button-foreground);
      border: none;
      cursor: pointer;
      border-radius: 4px;
    }
    button:hover { background: var(--vscode-button-hoverBackground); }
  </style>
</head>
<body>
  <div class="date">${escHtml(formatDate(date))}</div>
  ${projectsHtml}
  <div class="total">
    <span>Total</span>
    <span>${hm(total)}</span>
  </div>
  <button onclick="copy()">Copy to clipboard</button>
  <script>
    const vscode = acquireVsCodeApi();
    function copy() { vscode.postMessage({ command: 'copy' }); }
  </script>
</body>
</html>`;
}
