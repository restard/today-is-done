import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

const PROJECTS_SEARCH_DIRS = [
  join(homedir(), 'Documents', '_projects'),
];

export function resolveRepoPath(projectName: string): string | null {
  try {
    const map = JSON.parse(
      readFileSync(join(homedir(), '.timetracker', 'projects.json'), 'utf-8')
    ) as Record<string, string>;
    if (map[projectName]) return map[projectName];
  } catch {}

  for (const dir of PROJECTS_SEARCH_DIRS) {
    const candidate = join(dir, projectName);
    if (existsSync(join(candidate, '.git'))) return candidate;
  }
  return null;
}

export function getCommits(repoPath: string, date: string): string[] {
  try {
    const out = execSync(
      `git -C "${repoPath}" log --format="%s" --since="${date} 00:00:00" --until="${date} 23:59:59"`,
      { timeout: 3000, encoding: 'utf-8' }
    );
    return out.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}
