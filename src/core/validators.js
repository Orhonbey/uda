// src/core/validators.js

const VALID_ENGINES = ['unity', 'godot', 'unreal', 'threejs'];
const VALID_LEARN_TYPES = ['bug-fix', 'feature', 'pattern', 'knowledge', 'project', 'bug'];
const VALID_EXPORT_FORMATS = ['claude', 'cursor', 'agents-md', 'raw'];
const VALID_SEARCH_FORMATS = ['terminal', 'md', 'clipboard'];

/**
 * Validate result: { valid: true } or { valid: false, error: string }
 */

export function validateEngine(engine) {
  if (typeof engine !== 'string' || engine.trim() === '') {
    return { valid: false, error: 'Engine name must be a non-empty string.' };
  }
  if (!VALID_ENGINES.includes(engine)) {
    return { valid: false, error: `Unknown engine "${engine}". Valid engines: ${VALID_ENGINES.join(', ')}` };
  }
  return { valid: true };
}

export function validateConfigKey(key) {
  if (typeof key !== 'string' || key.trim() === '') {
    return { valid: false, error: 'Config key must be a non-empty string.' };
  }
  if (!/^[a-zA-Z0-9_]+(\.[a-zA-Z0-9_]+)*$/.test(key)) {
    return { valid: false, error: `Invalid config key "${key}". Use dot notation (e.g. "rag.enabled").` };
  }
  return { valid: true };
}

export function validateExportFormat(format) {
  if (typeof format !== 'string' || format.trim() === '') {
    return { valid: false, error: 'Export format must be a non-empty string.' };
  }
  if (!VALID_EXPORT_FORMATS.includes(format)) {
    return { valid: false, error: `Unknown format "${format}". Available: ${VALID_EXPORT_FORMATS.join(', ')}` };
  }
  return { valid: true };
}

export function validatePluginRepo(repo) {
  if (typeof repo !== 'string' || repo.trim() === '') {
    return { valid: false, error: 'Plugin repository URL must be a non-empty string.' };
  }
  const gitUrlPattern = /^(https?:\/\/.+\.git|git@.+:.+\.git|[a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)$/;
  if (!gitUrlPattern.test(repo.trim())) {
    return { valid: false, error: `Invalid repository URL "${repo}". Expected a git URL (e.g. https://github.com/user/repo.git) or shorthand (user/repo).` };
  }
  return { valid: true };
}

export function validatePluginName(name) {
  if (typeof name !== 'string' || name.trim() === '') {
    return { valid: false, error: 'Plugin name must be a non-empty string.' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(name)) {
    return { valid: false, error: `Invalid plugin name "${name}". Use only letters, numbers, hyphens and underscores.` };
  }
  return { valid: true };
}

export function validateLearnType(type) {
  if (typeof type !== 'string' || type.trim() === '') {
    return { valid: false, error: 'Learn type must be a non-empty string.' };
  }
  if (!VALID_LEARN_TYPES.includes(type)) {
    return { valid: false, error: `Unknown type "${type}". Valid types: ${VALID_LEARN_TYPES.join(', ')}` };
  }
  return { valid: true };
}

export function validateSearchQuery(query) {
  if (typeof query !== 'string' || query.trim() === '') {
    return { valid: false, error: 'Search query must be a non-empty string.' };
  }
  return { valid: true };
}

export function validatePositiveInt(value, name) {
  const parsed = parseInt(value, 10);
  if (isNaN(parsed) || parsed < 1) {
    return { valid: false, error: `${name} must be a positive integer. Got "${value}".` };
  }
  return { valid: true, value: parsed };
}

export function validateSearchFormat(format) {
  if (typeof format !== 'string' || format.trim() === '') {
    return { valid: false, error: 'Search format must be a non-empty string.' };
  }
  if (!VALID_SEARCH_FORMATS.includes(format)) {
    return { valid: false, error: `Unknown search format "${format}". Available: ${VALID_SEARCH_FORMATS.join(', ')}` };
  }
  return { valid: true };
}

const MANIFEST_REQUIRED = ['name', 'version', 'engine', 'uda_version'];

export function validateManifest(manifest) {
  if (!manifest || typeof manifest !== 'object') {
    return { valid: false, error: 'Manifest must be a JSON object.' };
  }

  for (const field of MANIFEST_REQUIRED) {
    if (!manifest[field] || typeof manifest[field] !== 'string') {
      return { valid: false, error: `Manifest must include a "${field}" string field.` };
    }
  }

  if (manifest.capabilities && typeof manifest.capabilities === 'object') {
    const caps = manifest.capabilities;
    if (caps.logs && typeof caps.logs === 'object') {
      if (!caps.logs.source || typeof caps.logs.source !== 'string') {
        return { valid: false, error: 'Capability "logs" must include a "source" path string.' };
      }
    }
  }

  return { valid: true };
}

export { VALID_ENGINES, VALID_LEARN_TYPES, VALID_EXPORT_FORMATS, VALID_SEARCH_FORMATS };
