// src/core/knowledge-loader.js
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function loadKnowledge(paths) {
  const knowledge = { project: {}, conventions: [], decisions: [] };

  try {
    const profile = await readFile(join(paths.knowledge.project, 'profile.md'), 'utf8');
    const nameMatch = profile.match(/Project:\s*(.+)/i);
    const engineMatch = profile.match(/Engine:\s*(.+)/i);
    if (nameMatch) knowledge.project.name = nameMatch[1].trim();
    if (engineMatch) knowledge.project.engine = engineMatch[1].trim();
  } catch { /* no profile yet */ }

  try {
    const decisions = await readFile(join(paths.knowledge.project, 'decisions.md'), 'utf8');
    knowledge.decisions = decisions.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2));
  } catch { /* no decisions yet */ }

  return knowledge;
}

export async function loadWorkflows(paths) {
  return [];
}

export async function loadAgents(paths) {
  return [];
}
