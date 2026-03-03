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

      // Read manifest
      const manifest = JSON.parse(await readFile(join(tmpDir, 'manifest.json'), 'utf8'));
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
          const data = JSON.parse(await readFile(join(this.paths.plugins, f), 'utf8'));
          plugins.push(data);
        }
      }
      return plugins;
    } catch {
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
}

async function cpDir(src, dest) {
  try {
    await cp(src, dest, { recursive: true });
  } catch {
    // Source directory might not exist
  }
}
