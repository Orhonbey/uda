import { PluginManager } from '../plugins/manager.js';
import { validatePluginRepo, validatePluginName } from '../core/validators.js';

export async function handlePluginAdd(repo) {
  const rv = validatePluginRepo(repo);
  if (!rv.valid) {
    console.error(`✘ ${rv.error}`);
    process.exitCode = 1;
    return;
  }

  const pm = new PluginManager(process.cwd());
  try {
    const manifest = await pm.add(repo);
    console.log(`✔ Plugin "${manifest.name}" v${manifest.version} installed`);
    console.log(`  Engine: ${manifest.engine || 'generic'}`);
    console.log(`  Run \`uda scan\` to index new knowledge`);
  } catch (err) {
    console.error(`✘ Failed to install plugin from "${repo}": ${err.message}`);
    process.exitCode = 1;
  }
}

export async function handlePluginList() {
  const pm = new PluginManager(process.cwd());
  let plugins;
  try {
    plugins = await pm.list();
  } catch (err) {
    console.error(`✘ Failed to list plugins: ${err.message}`);
    process.exitCode = 1;
    return;
  }
  if (plugins.length === 0) {
    console.log('No plugins installed. Run `uda plugin add <repo>` to install one.');
    return;
  }
  for (const p of plugins) {
    console.log(`  ✔ ${p.name || 'unknown'} (v${p.version || '?'}) — ${p.engine || 'generic'}`);
  }
}

export async function handlePluginRemove(name) {
  const nv = validatePluginName(name);
  if (!nv.valid) {
    console.error(`✘ ${nv.error}`);
    process.exitCode = 1;
    return;
  }

  const pm = new PluginManager(process.cwd());
  try {
    const meta = await pm.remove(name);
    console.log(`✔ Plugin "${meta.name}" removed`);
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error(`✘ Plugin "${name}" is not installed`);
    } else {
      console.error(`✘ Failed to remove plugin "${name}": ${err.message}`);
    }
    process.exitCode = 1;
  }
}

export async function handlePluginUpdate(name) {
  if (name) {
    const nv = validatePluginName(name);
    if (!nv.valid) {
      console.error(`✘ ${nv.error}`);
      process.exitCode = 1;
      return;
    }
  }

  const pm = new PluginManager(process.cwd());

  try {
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
  } catch (err) {
    if (err.code === 'ENOENT' && name) {
      console.error(`✘ Plugin "${name}" is not installed`);
    } else {
      console.error(`✘ Failed to update plugin${name ? ` "${name}"` : 's'}: ${err.message}`);
    }
    process.exitCode = 1;
  }
}
