import * as vscode from 'vscode';
import { Storage } from './storage';

export class Tracker {
  private storage: Storage;
  private startTime: number | null = null;
  private currentProject: string | null = null;
  private timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  private onStateChange: () => void;

  constructor(storage: Storage, onStateChange: () => void) {
    this.storage = storage;
    this.onStateChange = onStateChange;
  }

  get isTracking(): boolean {
    return this.startTime !== null;
  }

  get project(): string | null {
    return this.currentProject;
  }

  get elapsedSeconds(): number {
    if (!this.startTime) return 0;
    return Math.floor((Date.now() - this.startTime) / 1000);
  }

  activity(): void {
    const project = this.resolveProject();
    if (!project) return;

    if (!this.isTracking || this.currentProject !== project) {
      this.stop();
      this.startProject(project);
    }

    this.resetTimeout();
  }

  stop(): void {
    if (!this.isTracking || !this.currentProject || !this.startTime) return;

    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    if (seconds > 0) {
      this.storage.addSeconds(todayString(), this.currentProject, seconds);
    }

    this.startTime = null;
    this.currentProject = null;
    this.clearIdleTimeout();
    this.onStateChange();
  }

  dispose(): void {
    this.stop();
  }

  private startProject(project: string): void {
    this.startTime = Date.now();
    this.currentProject = project;
    this.onStateChange();
  }

  private resetTimeout(): void {
    this.clearIdleTimeout();
    const minutes = vscode.workspace
      .getConfiguration('timetracker')
      .get<number>('timeoutMinutes', 2);
    this.timeoutHandle = setTimeout(() => this.stop(), minutes * 60 * 1000);
  }

  private clearIdleTimeout(): void {
    if (this.timeoutHandle !== null) {
      clearTimeout(this.timeoutHandle);
      this.timeoutHandle = null;
    }
  }

  private resolveProject(): string | null {
    const folders = vscode.workspace.workspaceFolders;
    if (!folders || folders.length === 0) return null;
    return folders[0].name;
  }
}

export function todayString(): string {
  return new Date().toISOString().slice(0, 10);
}
