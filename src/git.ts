import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import * as vscode from 'vscode';

function getSearchDirs(): string[] {
  const cfg = vscode.workspace.getConfiguration('timetracker');
  const dirs = cfg.get<string[]>('projectsSearchDirs') ?? ['~/Documents'];
  return dirs.map(d => d.replace(/^~/, homedir()));
}

export function resolveRepoPath(projectName: string): string | null {
  try {
    const map = JSON.parse(
      readFileSync(join(homedir(), '.timetracker', 'projects.json'), 'utf-8')
    ) as Record<string, string>;
    if (map[projectName]) return map[projectName];
  } catch {}

  for (const dir of getSearchDirs()) {
    const candidate = join(dir, projectName);
    if (existsSync(join(candidate, '.git'))) return candidate;
  }
  return null;
}

export function getCommits(repoPath: string, date: string): string[] {
  try {
    const out = execSync(
      `git -C "${repoPath}" log --all --no-merges --format="%s" --since="${date} 00:00:00" --until="${date} 23:59:59"`,
      { timeout: 3000, encoding: 'utf-8' }
    );
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}
