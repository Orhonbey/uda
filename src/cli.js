import { Command } from 'commander';
import { initProject } from './core/init.js';

export function createCli() {
  const program = new Command();

  program
    .command('init')
    .description('Initialize UDA in current project')
    .option('-e, --engine <name>', 'Engine plugin to install (e.g. unity)')
    .action(async (options) => {
      const root = process.cwd();
      const paths = await initProject(root);
      console.log('✔ .uda/ directory created');

      if (options.engine) {
        console.log(`Engine: ${options.engine} — plugin install not yet implemented`);
      }
    });

  program
    .command('sync')
    .description('Generate AI tool files from knowledge base')
    .action(async () => {
      console.log('uda sync — not yet implemented');
    });

  program
    .command('search <query>')
    .description('Search knowledge base')
    .option('-t, --top <number>', 'Number of results', '5')
    .option('-f, --format <format>', 'Output format (terminal, md, clipboard)', 'terminal')
    .action(async (query, options) => {
      console.log('uda search — not yet implemented');
    });

  program
    .command('learn <source>')
    .description('Teach knowledge to RAG')
    .option('--type <type>', 'Knowledge type (bug-fix, feature, pattern, knowledge)', 'knowledge')
    .option('--tags <tags>', 'Comma-separated tags')
    .action(async (source, options) => {
      console.log('uda learn — not yet implemented');
    });

  program
    .command('scan')
    .description('Scan project and index into RAG')
    .action(async () => {
      console.log('uda scan — not yet implemented');
    });

  const pluginCmd = program
    .command('plugin')
    .description('Manage engine plugins');

  pluginCmd
    .command('add <repo>')
    .description('Install plugin from git repo')
    .action(async (repo) => {
      console.log('uda plugin add — not yet implemented');
    });

  pluginCmd
    .command('list')
    .description('List installed plugins')
    .action(async () => {
      console.log('uda plugin list — not yet implemented');
    });

  pluginCmd
    .command('remove <name>')
    .description('Remove a plugin')
    .action(async (name) => {
      console.log('uda plugin remove — not yet implemented');
    });

  pluginCmd
    .command('update [name]')
    .description('Update plugin(s)')
    .action(async (name) => {
      console.log('uda plugin update — not yet implemented');
    });

  pluginCmd
    .command('create <name>')
    .description('Scaffold a new plugin')
    .action(async (name) => {
      console.log('uda plugin create — not yet implemented');
    });

  program
    .command('export')
    .description('Export knowledge to specific format')
    .requiredOption('-f, --format <format>', 'Output format (claude, cursor, windsurf, agents-md, raw)')
    .option('-o, --output <path>', 'Output file path')
    .action(async (options) => {
      console.log('uda export — not yet implemented');
    });

  program
    .command('status')
    .description('Show UDA system status')
    .action(async () => {
      console.log('uda status — not yet implemented');
    });

  program
    .command('config')
    .description('Manage UDA settings')
    .argument('[key]', 'Config key to get/set')
    .argument('[value]', 'Value to set')
    .action(async (key, value) => {
      console.log('uda config — not yet implemented');
    });

  return program;
}
