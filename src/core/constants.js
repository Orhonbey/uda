// src/core/constants.js
import { join } from 'path';

export const DEFAULT_PLUGINS = {
  unity: 'https://github.com/Orhonbey/uda-unity-plugin.git',
  // godot: 'https://github.com/SunalSpaciel/uda-godot-plugin.git',
  // unreal: 'https://github.com/SunalSpaciel/uda-unreal-plugin.git',
};

export const UDA_DIR = '.uda';

export function udaPaths(root) {
  const uda = join(root, UDA_DIR);
  return {
    root: uda,
    config: join(uda, 'config.json'),
    knowledge: {
      root: join(uda, 'knowledge'),
      engine: join(uda, 'knowledge', 'engine'),
      project: join(uda, 'knowledge', 'project'),
      community: join(uda, 'knowledge', 'community'),
    },
    workflows: join(uda, 'workflows'),
    agents: join(uda, 'agents'),
    state: {
      root: join(uda, 'state'),
      current: join(uda, 'state', 'current.md'),
      features: join(uda, 'state', 'features'),
      history: join(uda, 'state', 'history'),
    },
    rag: {
      root: join(uda, 'rag'),
      lancedb: join(uda, 'rag', 'lancedb'),
      cache: join(uda, 'rag', 'cache'),
    },
    plugins: join(uda, 'plugins'),
    generated: join(uda, '.generated'),
    logs: join(uda, 'logs'),
  };
}
