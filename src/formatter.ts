import * as vscode from 'vscode';
import { DayRecord, TimeData } from './storage';
import { getCommits, resolveRepoPath } from './git';

const LINE = '──────────────────────────────';

function hm(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function formatDate(date: string): string {
  const locale = vscode.env.language;
  return new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

export function formatDay(date: string, dayData: DayRecord | undefined): string {
  if (!dayData || Object.keys(dayData).length === 0) {
    return `No activity recorded for ${formatDate(date)}.`;
  }

  const entries = Object.entries(dayData).sort(([, a], [, b]) => b - a);
  const lines: string[] = [];

  // summary section
  lines.push(LINE);
  lines.push(formatDate(date));
  lines.push('Good work today! 🎉');
  lines.push(LINE);

  for (const [project, seconds] of entries) {
    if (seconds === 0) continue;
    lines.push('');
    lines.push(project);
    const repoPath = resolveRepoPath(project);
    if (repoPath) {
      const commits = getCommits(repoPath, date);
      for (const c of commits) {
        lines.push(`- ${c}`);
      }
    }
  }

  // time breakdown section
  const total = entries.reduce((sum, [, s]) => sum + s, 0);
  lines.push('');
  lines.push(LINE);
  lines.push('Time by project');
  lines.push(LINE);
  for (const [project, seconds] of entries) {
    lines.push(`- ${project.padEnd(20)} ${hm(seconds)}`);
  }
  lines.push(LINE);
  lines.push(`${'Total'.padEnd(20)} ${hm(total)}`);
  lines.push(LINE);

  return lines.join('\n');
}

export function formatLog(data: TimeData, days = 7): string {
  const dates = Object.keys(data).sort().reverse().slice(0, days);
  if (dates.length === 0) return 'Start coding to begin tracking!';
  return dates.map(d => formatDay(d, data[d])).join('\n\n---\n\n');
}
