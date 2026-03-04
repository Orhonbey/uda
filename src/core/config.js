// src/core/config.js
import { readFile, writeFile } from 'fs/promises';
import { udaPaths } from './constants.js';

export async function loadConfig(root) {
  const paths = udaPaths(root);
  return JSON.parse(await readFile(paths.config, 'utf8'));
}

export async function saveConfig(root, config) {
  const paths = udaPaths(root);
  await writeFile(paths.config, JSON.stringify(config, null, 2));
}

export function getConfigValue(config, key) {
  const parts = key.split('.');
  let current = config;
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return undefined;
    current = current[part];
  }
  return current;
}

export function setConfigValue(config, key, value) {
  const parts = key.split('.');
  let current = config;
  for (let i = 0; i < parts.length - 1; i++) {
    if (current[parts[i]] == null || typeof current[parts[i]] !== 'object') {
      current[parts[i]] = {};
    }
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = parseValue(value);
}

function parseValue(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (value === 'null') return null;
  if (/^\d+$/.test(value)) return parseInt(value, 10);
  if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
  if (value.startsWith('[') && value.endsWith(']')) {
    return value.slice(1, -1).split(',').map(s => s.trim());
  }
  return value;
}
