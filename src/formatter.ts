import * as vscode from 'vscode';
import { DayRecord, TimeData } from './storage';
import { getCommits, resolveRepoPath } from './git';

const SEPARATOR = '──────────────────────────────';

const DEFAULT_TEMPLATE = [
  '{separator}',
  '{date}',
  'Good work today! 🎉',
  '{separator}',
  '{projects}',
  '{separator}',
  'Time by project',
  '{separator}',
  '{timeBreakdown}',
  '{separator}',
  'Total                {total}',
  '{separator}',
];

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

  const cfg = vscode.workspace.getConfiguration('timetracker');
  const template = cfg.get<string[]>('copyTemplate') ?? DEFAULT_TEMPLATE;

  const entries = Object.entries(dayData)
    .filter(([, s]) => s > 0)
    .sort(([, a], [, b]) => b - a);
  const total = entries.reduce((sum, [, s]) => sum + s, 0);

  const projectsBlock: string[] = [];
  for (const [project] of entries) {
    if (projectsBlock.length > 0) projectsBlock.push('');
    projectsBlock.push(project);
    const repoPath = resolveRepoPath(project);
    if (repoPath) {
      const commits = getCommits(repoPath, date);
      for (const c of commits) projectsBlock.push(`- ${c}`);
    }
  }

  const timeBreakdownBlock = entries.map(
    ([project, seconds]) => `- ${project.padEnd(20)} ${hm(seconds)}`
  );

  const formattedDate = formatDate(date);
  const totalHm = hm(total);

  const lines: string[] = [];
  for (const tpl of template) {
    if (tpl === '{projects}') {
      lines.push(...projectsBlock);
    } else if (tpl === '{timeBreakdown}') {
      lines.push(...timeBreakdownBlock);
    } else {
      lines.push(
        tpl
          .replace('{date}', formattedDate)
          .replace('{separator}', SEPARATOR)
          .replace('{total}', totalHm)
      );
    }
  }

  return lines.join('\n');
}

export function formatLog(data: TimeData, days = 7): string {
  const dates = Object.keys(data).sort().reverse().slice(0, days);
  if (dates.length === 0) return 'Start coding to begin tracking!';
  return dates.map(d => formatDay(d, data[d])).join('\n\n---\n\n');
}
