import * as vscode from 'vscode';
import { Storage } from './storage';
import { Tracker, todayString } from './tracker';
import { StatusBar } from './statusbar';
import { formatDay, formatLog } from './formatter';
import { showTodayPanel } from './panel';

export function activate(context: vscode.ExtensionContext): void {
  const storage = new Storage();
  const tracker = new Tracker(storage, () => statusBar.update());
  const statusBar = new StatusBar(tracker, storage);

  const onActivity = () => tracker.activity();

  context.subscriptions.push(
    vscode.workspace.onDidChangeTextDocument(onActivity),
    vscode.window.onDidChangeActiveTextEditor(onActivity),
    vscode.window.onDidChangeTextEditorSelection(onActivity),
    vscode.window.onDidChangeActiveTerminal(onActivity),
    vscode.window.onDidOpenTerminal(onActivity),
    vscode.window.onDidChangeWindowState(e => {
      if (e.focused) {
        onActivity();
      } else {
        tracker.stop();
      }
    }),

    vscode.commands.registerCommand('timetracker.copyToday', async () => {
      const today = todayString();
      const data = storage.load();
      const text = formatDay(today, data[today]);
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('Copied to clipboard!');
    }),

    vscode.commands.registerCommand('timetracker.copyDate', async () => {
      const input = await vscode.window.showInputBox({
        prompt: 'Enter date (YYYY-MM-DD)',
        placeHolder: todayString(),
        validateInput: v =>
          /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : 'Please use YYYY-MM-DD format',
      });
      if (!input) return;
      const data = storage.load();
      const text = formatDay(input, data[input]);
      await vscode.env.clipboard.writeText(text);
      vscode.window.showInformationMessage('Copied to clipboard!');
    }),

    vscode.commands.registerCommand('timetracker.showLog', () => {
      const data = storage.load();
      const text = formatLog(data);
      const panel = vscode.window.createWebviewPanel(
        'timetrackerLog',
        'Time Tracker Log',
        vscode.ViewColumn.One,
        {}
      );
      panel.webview.html = `<!DOCTYPE html><html><body>
        <pre style="font-family:monospace;padding:16px;white-space:pre-wrap">${escHtml(text)}</pre>
      </body></html>`;
    }),

    vscode.commands.registerCommand('timetracker.showPanel', () => {
      showTodayPanel(context, storage);
    }),

    vscode.commands.registerCommand('timetracker.reset', async () => {
      const answer = await vscode.window.showWarningMessage(
        "Delete today's data? This cannot be undone.",
        { modal: true },
        'Yes'
      );
      if (answer !== 'Yes') return;
      storage.deleteDay(todayString());
      statusBar.update();
      vscode.window.showInformationMessage("Today's data has been reset");
    }),

    { dispose: () => { tracker.dispose(); statusBar.dispose(); } }
  );
}

export function deactivate(): void {}

function escHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
