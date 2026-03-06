import { Command } from 'commander';
import { handleLearn } from './commands/learn.js';
import { handleSearch } from './commands/search.js';
import { handleScan } from './commands/scan.js';
import { handleSync } from './commands/sync.js';
import { handleInit } from './commands/init.js';
import { handlePluginAdd, handlePluginList, handlePluginRemove } from './commands/plugin.js';
import { handleStatus } from './commands/status.js';
import { handleConfig } from './commands/config.js';
import { handlePluginUpdate } from './commands/plugin.js';
import { handleExport } from './commands/export.js';
import { handleLogs } from './commands/logs.js';

export function createCli() {
  const program = new Command();

  program
    .command('init')
    .description('Initialize UDA in current project')
    .option('-e, --engine <name>', 'Engine plugin to install (e.g. unity)')
    .action(handleInit);

  program
    .command('sync')
    .description('Generate AI tool files from knowledge base')
    .action(handleSync);

  program
    .command('search <query>')
    .description('Search knowledge base')
    .option('-t, --top <number>', 'Number of results', '5')
    .option('-f, --format <format>', 'Output format (terminal, md, clipboard)', 'terminal')
    .action(handleSearch);

  program
    .command('learn <source>')
    .description('Teach knowledge to RAG')
    .option('--type <type>', 'Knowledge type (bug-fix, feature, pattern, knowledge)', 'knowledge')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(handleLearn);

  program
    .command('scan')
    .description('Scan project and index into RAG')
    .action(handleScan);

  const pluginCmd = program
    .command('plugin')
    .description('Manage engine plugins');

  pluginCmd
    .command('add <repo>')
    .description('Install plugin from git repo')
    .action(handlePluginAdd);

  pluginCmd
    .command('list')
    .description('List installed plugins')
    .action(handlePluginList);

  pluginCmd
    .command('remove <name>')
    .description('Remove a plugin')
    .action(handlePluginRemove);

  pluginCmd
    .command('update [name]')
    .description('Update plugin(s)')
    .action(handlePluginUpdate);

  pluginCmd
    .command('create <name>')
    .description('Scaffold a new plugin')
    .action(async (name) => {
      console.log('uda plugin create — not yet implemented');
    });

  program
    .command('export')
    .description('Export knowledge to specific format')
    .requiredOption('-f, --format <format>', 'Output format (claude, cursor, agents-md, raw)')
    .option('-o, --output <path>', 'Output directory')
    .action(handleExport);

  program
    .command('status')
    .description('Show UDA system status')
    .action(handleStatus);

  program
    .command('config')
    .description('Manage UDA settings')
    .argument('[key]', 'Config key to get/set')
    .argument('[value]', 'Value to set')
    .action(handleConfig);

  program
    .command('logs')
    .description('Read engine console logs')
    .option('-e, --errors', 'Show only errors')
    .option('-w, --warnings', 'Show only warnings')
    .option('-l, --last <count>', 'Show last N entries')
    .action(handleLogs);

  return program;
}
