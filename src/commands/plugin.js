import { PluginManager } from '../plugins/manager.js';

export async function handlePluginAdd(repo) {
  const pm = new PluginManager(process.cwd());
  const manifest = await pm.add(repo);
  console.log(`✔ Plugin "${manifest.name}" v${manifest.version} installed`);
  console.log(`  Engine: ${manifest.engine || 'generic'}`);
  console.log(`  Run \`uda scan\` to index new knowledge`);
}

export async function handlePluginList() {
  const pm = new PluginManager(process.cwd());
  const plugins = await pm.list();
  if (plugins.length === 0) {
    console.log('No plugins installed. Run `uda plugin add <repo>` to install one.');
    return;
  }
  for (const p of plugins) {
    console.log(`  ✔ ${p.name} (v${p.version}) — ${p.engine || 'generic'}`);
  }
}

export async function handlePluginRemove(name) {
  const pm = new PluginManager(process.cwd());
  const meta = await pm.remove(name);
  console.log(`✔ Plugin "${meta.name}" removed`);
}
