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

export async function handlePluginUpdate(name) {
  const pm = new PluginManager(process.cwd());

  if (name) {
    const result = await pm.update(name);
    console.log(`✔ Plugin "${result.name}" updated (${result.commitHash?.slice(0, 7) || 'latest'})`);
  } else {
    const results = await pm.updateAll();
    if (results.length === 0) {
      console.log('No plugins installed.');
      return;
    }
    for (const r of results) {
      console.log(`  ✔ ${r.name} updated (${r.commitHash?.slice(0, 7) || 'latest'})`);
    }
    console.log(`\n✔ ${results.length} plugin(s) updated`);
  }
}
