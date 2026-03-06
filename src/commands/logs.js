import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { udaPaths } from '../core/constants.js';

export async function handleLogs(options) {
  const root = process.cwd();
  const paths = udaPaths(root);
  const logsDir = paths.logs;

  // Find log files
  let logFiles;
  try {
    const files = await readdir(logsDir);
    logFiles = files.filter(f => f.endsWith('.jsonl'));
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('No log files found. Is a log bridge plugin installed?');
      return;
    }
    throw err;
  }

  if (logFiles.length === 0) {
    console.log('No log files found. Is a log bridge plugin installed?');
    return;
  }

  // Read and parse all log entries
  let entries = [];
  for (const file of logFiles) {
    const content = await readFile(join(logsDir, file), 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    for (const line of lines) {
      try {
        entries.push(JSON.parse(line));
      } catch {
        // skip malformed lines
      }
    }
  }

  // Filter by level
  if (options.errors) {
    entries = entries.filter(e => e.level === 'Error' || e.level === 'Exception');
  } else if (options.warnings) {
    entries = entries.filter(e => e.level === 'Warning');
  }

  // Limit results
  if (options.last) {
    const n = parseInt(options.last, 10) || 20;
    entries = entries.slice(-n);
  }

  if (entries.length === 0) {
    console.log('No matching log entries.');
    return;
  }

  // Display
  console.log(`Showing ${entries.length} log entries:\n`);
  for (const entry of entries) {
    const time = entry.timestamp ? new Date(entry.timestamp).toLocaleTimeString() : '??:??';
    const level = (entry.level || 'Log').padEnd(9);
    console.log(`[${time}] ${level} ${entry.message}`);
    if (entry.stackTrace) {
      console.log(`           ${entry.stackTrace.split('\n')[0]}`);
    }
  }
}
