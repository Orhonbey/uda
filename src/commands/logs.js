import { readFile } from 'fs/promises';
import { join } from 'path';
import { udaPaths } from '../core/constants.js';

export async function handleLogs(options) {
  const root = process.cwd();
  const paths = udaPaths(root);
  const logsDir = paths.logs;

  // Determine which file to read
  const isTrace = options.trace || options.channel;
  const targetFile = isTrace ? 'trace.jsonl' : 'console.jsonl';

  // Read target file
  let content;
  try {
    content = await readFile(join(logsDir, targetFile), 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log(isTrace
        ? 'No trace logs found. Use Debug.Log("[uda:channel] message") in Unity.'
        : 'No log files found. Is a log bridge plugin installed?');
      return;
    }
    throw err;
  }

  // Parse entries
  let entries = [];
  const lines = content.split('\n').filter(l => l.trim());
  for (const line of lines) {
    try {
      entries.push(JSON.parse(line));
    } catch {
      // skip malformed lines
    }
  }

  // Filter
  if (options.errors) {
    entries = entries.filter(e => e.type === 'Error' || e.type === 'Exception');
  } else if (options.channel) {
    entries = entries.filter(e => e.type === options.channel);
  }

  // Limit
  if (options.last) {
    const n = parseInt(options.last, 10) || 20;
    entries = entries.slice(-n);
  }

  if (entries.length === 0) {
    console.log('No matching log entries.');
    return;
  }

  // Display
  console.log(`Showing ${entries.length} ${isTrace ? 'trace' : 'log'} entries:\n`);
  for (const entry of entries) {
    const time = entry.time
      ? new Date(entry.time).toLocaleTimeString()
      : entry.timestamp
        ? new Date(entry.timestamp).toLocaleTimeString()
        : '??:??';
    const label = (entry.type || 'Log').padEnd(9);
    console.log(`[${time}] ${label} ${entry.message}`);
    if (entry.stack || entry.stackTrace) {
      const st = entry.stack || entry.stackTrace;
      if (st) console.log(`           ${st.split('\n')[0]}`);
    }
  }
}
