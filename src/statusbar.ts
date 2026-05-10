import * as vscode from 'vscode';
import { Tracker, todayString } from './tracker';
import { Storage } from './storage';

function hm(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m}m`;
}

export class StatusBar {
  private item: vscode.StatusBarItem;
  private timer: ReturnType<typeof setInterval>;

  constructor(private tracker: Tracker, private storage: Storage) {
    this.item = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
    this.item.command = 'timetracker.showPanel';
    this.item.tooltip = "Open Today's Done panel";
    this.item.show();
    this.update();
    this.timer = setInterval(() => this.update(), 1000);
  }

  update(): void {
    if (this.tracker.isTracking) {
      const e = this.tracker.elapsedSeconds;
      const h = Math.floor(e / 3600);
      const m = Math.floor((e % 3600) / 60);
      const s = e % 60;
      const clock = `${h}:${pad(m)}:${pad(s)}`;
      this.item.text = `⏱ ${this.tracker.project}  ${clock}`;
    } else {
      const day = this.storage.load()[todayString()] ?? {};
      const total = Object.values(day).reduce((a, b) => a + b, 0);
      this.item.text = `⏸ Today: ${hm(total)}`;
    }
  }

  dispose(): void {
    clearInterval(this.timer);
    this.item.dispose();
  }
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}
