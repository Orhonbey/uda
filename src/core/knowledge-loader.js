// src/core/knowledge-loader.js
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { parse as parseYaml } from 'yaml';

export async function loadKnowledge(paths) {
  const knowledge = { project: {}, conventions: [], decisions: [] };

  try {
    const profile = await readFile(join(paths.knowledge.project, 'profile.md'), 'utf8');
    const nameMatch = profile.match(/Project:\s*(.+)/i);
    const engineMatch = profile.match(/Engine:\s*(.+)/i);
    if (nameMatch) knowledge.project.name = nameMatch[1].trim();
    if (engineMatch) knowledge.project.engine = engineMatch[1].trim();
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Warning: Failed to read project profile: ${err.message}`);
    }
  }

  try {
    const decisions = await readFile(join(paths.knowledge.project, 'decisions.md'), 'utf8');
    knowledge.decisions = decisions.split('\n')
      .filter(l => l.startsWith('- '))
      .map(l => l.slice(2));
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`Warning: Failed to read decisions file: ${err.message}`);
    }
  }

  return knowledge;
}

export async function loadWorkflows(paths) {
  const workflows = [];
  let files;
  try {
    files = await readdir(paths.workflows);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  for (const file of files) {
    if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue;
    try {
      const content = await readFile(join(paths.workflows, file), 'utf8');
      const parsed = parseYaml(content);
      if (parsed && parsed.name) {
        workflows.push(parsed);
      }
    } catch (err) {
      console.error(`Warning: Failed to parse workflow "${file}": ${err.message}`);
    }
  }

  return workflows;
}

export async function loadAgents(paths) {
  const agents = [];
  let files;
  try {
    files = await readdir(paths.agents);
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }

  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    try {
      const content = await readFile(join(paths.agents, file), 'utf8');
      const agent = parseFrontmatter(content);
      if (agent.name) {
        agents.push(agent);
      }
    } catch (err) {
      console.error(`Warning: Failed to parse agent "${file}": ${err.message}`);
    }
  }

  return agents;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { prompt: content };

  const meta = parseYaml(match[1]);
  return { ...meta, prompt: match[2].trim() };
}
