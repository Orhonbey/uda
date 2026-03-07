import { createInterface } from 'readline';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { initProject } from '../core/init.js';
import { handleScan } from './scan.js';
import { handleSync } from './sync.js';
import { handlePluginAdd } from './plugin.js';
import { validateEngine } from '../core/validators.js';
import { DEFAULT_PLUGINS } from '../core/constants.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

export async function handleInit(options) {
  const root = process.cwd();

  // Validate engine option if provided
  if (options.engine) {
    const v = validateEngine(options.engine);
    if (!v.valid) {
      console.error(`✘ ${v.error}`);
      process.exitCode = 1;
      return;
    }
  }

  console.log(`UDA v${pkg.version}\n`);

  // Step 1: Create directory structure
  console.log('Creating project structure...');
  try {
    await initProject(root);
  } catch (err) {
    console.error(`✘ Failed to create project structure: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  console.log('✔ .uda/ directory created\n');

  // Step 2: Engine detection + plugin install prompt
  const engine = options.engine || await detectEngine(root);
  if (engine) {
    console.log(`✔ Engine detected: ${engine}`);
    const defaultUrl = DEFAULT_PLUGINS[engine];
    if (defaultUrl && !options.skipPlugin) {
      await promptPluginInstall(engine, defaultUrl);
    } else if (!defaultUrl) {
      console.log(`  No default plugin available for ${engine}.`);
      console.log(`  Run \`uda plugin add <repo>\` to install a ${engine} plugin\n`);
    }
  }

  // Step 3: Initial scan
  console.log('Scanning knowledge base...');
  await handleScan();

  // Step 4: Generate AI tool files
  console.log('\nGenerating AI tool files...');
  await handleSync();

  console.log('\n✔ UDA is ready!');
  console.log('  uda search "your query"');
  console.log('  uda learn <file.md>');
  console.log('  uda plugin add <git-repo>');
}

async function promptPluginInstall(engine, defaultUrl) {
  const answer = await ask(
    `\n  Install official ${engine} plugin?\n` +
    `    [Y] Yes, install default (${defaultUrl})\n` +
    `    [C] Custom — enter your own plugin URL\n` +
    `    [N] No, skip\n` +
    `  Choice (Y/c/n): `
  );

  const choice = answer.trim().toLowerCase();

  if (choice === 'n') {
    console.log('  Skipped plugin installation.\n');
    return;
  }

  let repoUrl = defaultUrl;

  if (choice === 'c') {
    repoUrl = await ask('  Plugin git URL: ');
    repoUrl = repoUrl.trim();
    if (!repoUrl) {
      console.log('  No URL provided. Skipped plugin installation.\n');
      return;
    }
  }

  console.log(`\n  Installing ${engine} plugin...`);
  await handlePluginAdd(repoUrl);
  console.log('');
}

function ask(question) {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function detectEngine(root) {
  const { existsSync } = await import('fs');
  const { join } = await import('path');

  if (existsSync(join(root, 'ProjectSettings', 'ProjectVersion.txt'))) return 'unity';
  if (existsSync(join(root, 'project.godot'))) return 'godot';
  if (existsSync(join(root, 'Config', 'DefaultEngine.ini'))) return 'unreal';

  return null;
}
