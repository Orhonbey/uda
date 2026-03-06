import { simpleGit } from 'simple-git';
import { readFile, writeFile, rm, readdir, mkdir, cp } from 'fs/promises';
import { join, basename } from 'path';
import { udaPaths } from '../core/constants.js';

export class PluginManager {
  constructor(projectRoot) {
    this.root = projectRoot;
    this.paths = udaPaths(projectRoot);
  }

  async add(repoUrl) {
    const tmpDir = join(this.paths.root, '.tmp-plugin');
    const git = simpleGit();

    try {
      // Clone repo
      await git.clone(repoUrl, tmpDir, ['--depth', '1']);

      // Get commit hash
      const log = await git.cwd(tmpDir).log(['-1']);
      const commitHash = log.latest?.hash || 'unknown';

      // Read manifest
      let manifestRaw;
      try {
        manifestRaw = await readFile(join(tmpDir, 'manifest.json'), 'utf8');
      } catch (err) {
        throw new Error(`Plugin repository is missing manifest.json`);
      }

      let manifest;
      try {
        manifest = JSON.parse(manifestRaw);
      } catch (err) {
        throw new Error(`Plugin manifest.json contains invalid JSON: ${err.message}`);
      }

      if (!manifest.name || typeof manifest.name !== 'string') {
        throw new Error('Plugin manifest.json must include a "name" field');
      }
      const pluginName = manifest.name;

      // Copy knowledge files
      const knowledgeDir = join(tmpDir, 'knowledge');
      const targetKnowledge = join(this.paths.knowledge.engine, manifest.engine || pluginName);
      await mkdir(targetKnowledge, { recursive: true });
      await cpDir(knowledgeDir, targetKnowledge);

      // Copy workflows
      const workflowDir = join(tmpDir, 'workflows');
      await cpDir(workflowDir, this.paths.workflows);

      // Copy agents
      const agentDir = join(tmpDir, 'agents');
      await cpDir(agentDir, this.paths.agents);

      // Save plugin metadata
      const pluginMeta = {
        ...manifest,
        repo: repoUrl,
        installedAt: new Date().toISOString(),
        commitHash,
      };
      await writeFile(
        join(this.paths.plugins, `${manifest.engine || pluginName}.json`),
        JSON.stringify(pluginMeta, null, 2)
      );

      return manifest;
    } finally {
      await rm(tmpDir, { recursive: true, force: true });
    }
  }

  async list() {
    try {
      const files = await readdir(this.paths.plugins);
      const plugins = [];
      for (const f of files) {
        if (f.endsWith('.json')) {
          try {
            const data = JSON.parse(await readFile(join(this.paths.plugins, f), 'utf8'));
            plugins.push(data);
          } catch (err) {
            console.error(`Warning: Failed to read plugin metadata "${f}": ${err.message}`);
          }
        }
      }
      return plugins;
    } catch (err) {
      if (err.code !== 'ENOENT') {
        console.error(`Warning: Failed to list plugins: ${err.message}`);
      }
      return [];
    }
  }

  async remove(name) {
    const metaPath = join(this.paths.plugins, `${name}.json`);
    const meta = JSON.parse(await readFile(metaPath, 'utf8'));

    // Remove engine knowledge
    const engineDir = join(this.paths.knowledge.engine, meta.engine || name);
    await rm(engineDir, { recursive: true, force: true });

    // Remove metadata
    await rm(metaPath);

    return meta;
  }

  async update(name) {
    const metaPath = join(this.paths.plugins, `${name}.json`);
    const meta = JSON.parse(await readFile(metaPath, 'utf8'));

    // Remove old files and metadata
    await this.remove(name);

    // Re-add from repo
    const newManifest = await this.add(meta.repo);

    return { old: meta, new: newManifest };
  }

  async updateAll() {
    const plugins = await this.list();
    const results = [];

    for (const plugin of plugins) {
      const name = plugin.engine || plugin.name;
      const result = await this.update(name);
      results.push({ name, ...result });
    }

    return results;
  }
}

async function cpDir(src, dest) {
  try {
    await cp(src, dest, { recursive: true });
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Warning: Failed to copy "${src}" to "${dest}": ${err.message}`);
    }
  }
}
