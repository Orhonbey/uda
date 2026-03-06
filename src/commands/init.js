import { initProject } from '../core/init.js';
import { handleScan } from './scan.js';
import { handleSync } from './sync.js';
import { validateEngine } from '../core/validators.js';

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

  console.log('UDA v0.2.0\n');

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

  // Step 2: Engine detection
  const engine = options.engine || await detectEngine(root);
  if (engine) {
    console.log(`✔ Engine detected: ${engine}`);
    console.log(`  Run \`uda plugin add <repo>\` to install ${engine} plugin\n`);
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

async function detectEngine(root) {
  const { existsSync } = await import('fs');
  const { join } = await import('path');

  if (existsSync(join(root, 'ProjectSettings', 'ProjectVersion.txt'))) return 'unity';
  if (existsSync(join(root, 'project.godot'))) return 'godot';
  if (existsSync(join(root, 'Config', 'DefaultEngine.ini'))) return 'unreal';

  return null;
}
