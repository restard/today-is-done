import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export type DayRecord = Record<string, number>;
export type TimeData = Record<string, DayRecord>;

const DIR = path.join(os.homedir(), '.timetracker');
const FILE = path.join(DIR, 'log.json');

export class Storage {
  constructor() {
    fs.mkdirSync(DIR, { recursive: true });
  }

  load(): TimeData {
    try {
      return JSON.parse(fs.readFileSync(FILE, 'utf-8')) as TimeData;
    } catch {
      return {};
    }
  }

  save(data: TimeData): void {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  addSeconds(date: string, project: string, seconds: number): void {
    const data = this.load();
    if (!data[date]) data[date] = {};
    data[date][project] = (data[date][project] ?? 0) + seconds;
    this.save(data);
  }

  deleteDay(date: string): void {
    const data = this.load();
    delete data[date];
    this.save(data);
  }
}
