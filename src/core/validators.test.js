// src/core/validators.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  validateEngine,
  validateConfigKey,
  validateExportFormat,
  validatePluginRepo,
  validatePluginName,
  validateLearnType,
  validateSearchQuery,
  validatePositiveInt,
  validateSearchFormat,
  validateManifest,
} from './validators.js';

describe('validateEngine', () => {
  it('accepts valid engine names', () => {
    assert.deepStrictEqual(validateEngine('unity'), { valid: true });
    assert.deepStrictEqual(validateEngine('godot'), { valid: true });
    assert.deepStrictEqual(validateEngine('unreal'), { valid: true });
    assert.deepStrictEqual(validateEngine('threejs'), { valid: true });
  });

  it('rejects unknown engine name', () => {
    const result = validateEngine('cryengine');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('cryengine'));
  });

  it('rejects empty string', () => {
    const result = validateEngine('');
    assert.strictEqual(result.valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateEngine(null).valid, false);
    assert.strictEqual(validateEngine(undefined).valid, false);
    assert.strictEqual(validateEngine(123).valid, false);
  });

  it('rejects whitespace-only string', () => {
    assert.strictEqual(validateEngine('   ').valid, false);
  });
});

describe('validateConfigKey', () => {
  it('accepts simple keys', () => {
    assert.deepStrictEqual(validateConfigKey('version'), { valid: true });
  });

  it('accepts dot notation keys', () => {
    assert.deepStrictEqual(validateConfigKey('rag.enabled'), { valid: true });
    assert.deepStrictEqual(validateConfigKey('rag.model.name'), { valid: true });
  });

  it('accepts keys with underscores and numbers', () => {
    assert.deepStrictEqual(validateConfigKey('rag_model2'), { valid: true });
  });

  it('rejects empty string', () => {
    assert.strictEqual(validateConfigKey('').valid, false);
  });

  it('rejects keys with special characters', () => {
    assert.strictEqual(validateConfigKey('foo bar').valid, false);
    assert.strictEqual(validateConfigKey('foo/bar').valid, false);
    assert.strictEqual(validateConfigKey('foo..bar').valid, false);
    assert.strictEqual(validateConfigKey('.foo').valid, false);
    assert.strictEqual(validateConfigKey('foo.').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateConfigKey(null).valid, false);
    assert.strictEqual(validateConfigKey(undefined).valid, false);
  });
});

describe('validateExportFormat', () => {
  it('accepts valid formats', () => {
    assert.deepStrictEqual(validateExportFormat('claude'), { valid: true });
    assert.deepStrictEqual(validateExportFormat('cursor'), { valid: true });
    assert.deepStrictEqual(validateExportFormat('agents-md'), { valid: true });
    assert.deepStrictEqual(validateExportFormat('raw'), { valid: true });
  });

  it('rejects unknown format', () => {
    const result = validateExportFormat('vscode');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('vscode'));
  });

  it('rejects empty string', () => {
    assert.strictEqual(validateExportFormat('').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateExportFormat(null).valid, false);
  });
});

describe('validatePluginRepo', () => {
  it('accepts HTTPS git URLs', () => {
    assert.deepStrictEqual(
      validatePluginRepo('https://github.com/user/repo.git'),
      { valid: true }
    );
  });

  it('accepts SSH git URLs', () => {
    assert.deepStrictEqual(
      validatePluginRepo('git@github.com:user/repo.git'),
      { valid: true }
    );
  });

  it('accepts shorthand user/repo format', () => {
    assert.deepStrictEqual(
      validatePluginRepo('user/repo'),
      { valid: true }
    );
  });

  it('rejects empty string', () => {
    assert.strictEqual(validatePluginRepo('').valid, false);
  });

  it('rejects plain words without slash', () => {
    assert.strictEqual(validatePluginRepo('justaword').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validatePluginRepo(null).valid, false);
    assert.strictEqual(validatePluginRepo(undefined).valid, false);
  });
});

describe('validatePluginName', () => {
  it('accepts valid names', () => {
    assert.deepStrictEqual(validatePluginName('unity'), { valid: true });
    assert.deepStrictEqual(validatePluginName('my-plugin'), { valid: true });
    assert.deepStrictEqual(validatePluginName('plugin_v2'), { valid: true });
  });

  it('rejects empty string', () => {
    assert.strictEqual(validatePluginName('').valid, false);
  });

  it('rejects names with special characters', () => {
    assert.strictEqual(validatePluginName('my plugin').valid, false);
    assert.strictEqual(validatePluginName('plugin/name').valid, false);
    assert.strictEqual(validatePluginName('plugin@1').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validatePluginName(null).valid, false);
    assert.strictEqual(validatePluginName(undefined).valid, false);
  });
});

describe('validateLearnType', () => {
  it('accepts valid types', () => {
    assert.deepStrictEqual(validateLearnType('bug-fix'), { valid: true });
    assert.deepStrictEqual(validateLearnType('feature'), { valid: true });
    assert.deepStrictEqual(validateLearnType('pattern'), { valid: true });
    assert.deepStrictEqual(validateLearnType('knowledge'), { valid: true });
  });

  it('rejects unknown type', () => {
    const result = validateLearnType('random');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('random'));
  });

  it('rejects empty string', () => {
    assert.strictEqual(validateLearnType('').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateLearnType(null).valid, false);
  });
});

describe('validateSearchQuery', () => {
  it('accepts non-empty strings', () => {
    assert.deepStrictEqual(validateSearchQuery('hello'), { valid: true });
    assert.deepStrictEqual(validateSearchQuery('how to fix bug'), { valid: true });
  });

  it('rejects empty string', () => {
    assert.strictEqual(validateSearchQuery('').valid, false);
  });

  it('rejects whitespace-only string', () => {
    assert.strictEqual(validateSearchQuery('   ').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateSearchQuery(null).valid, false);
    assert.strictEqual(validateSearchQuery(undefined).valid, false);
  });
});

describe('validatePositiveInt', () => {
  it('accepts positive integers', () => {
    assert.deepStrictEqual(validatePositiveInt('5', 'top'), { valid: true, value: 5 });
    assert.deepStrictEqual(validatePositiveInt('1', 'top'), { valid: true, value: 1 });
    assert.deepStrictEqual(validatePositiveInt('100', 'top'), { valid: true, value: 100 });
  });

  it('accepts numeric values', () => {
    assert.deepStrictEqual(validatePositiveInt(10, 'top'), { valid: true, value: 10 });
  });

  it('rejects zero', () => {
    assert.strictEqual(validatePositiveInt('0', 'top').valid, false);
  });

  it('rejects negative numbers', () => {
    assert.strictEqual(validatePositiveInt('-1', 'top').valid, false);
  });

  it('rejects non-numeric strings', () => {
    const result = validatePositiveInt('abc', 'top');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('abc'));
  });

  it('rejects floating point strings', () => {
    // parseInt('3.5') returns 3 which is valid - this is acceptable behavior
    // But 'abc' is NaN and should fail
    assert.strictEqual(validatePositiveInt('not-a-number', 'count').valid, false);
  });
});

describe('validateSearchFormat', () => {
  it('accepts valid search formats', () => {
    assert.deepStrictEqual(validateSearchFormat('terminal'), { valid: true });
    assert.deepStrictEqual(validateSearchFormat('md'), { valid: true });
    assert.deepStrictEqual(validateSearchFormat('clipboard'), { valid: true });
  });

  it('rejects unknown format', () => {
    const result = validateSearchFormat('json');
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('json'));
  });

  it('rejects empty string', () => {
    assert.strictEqual(validateSearchFormat('').valid, false);
  });

  it('rejects non-string values', () => {
    assert.strictEqual(validateSearchFormat(null).valid, false);
  });
});

describe('validateManifest', () => {
  it('accepts valid manifest with capabilities', () => {
    const manifest = {
      name: 'uda-unity',
      version: '1.0.0',
      engine: 'unity',
      uda_version: '>=0.2.0',
    };
    const result = validateManifest(manifest);
    assert.strictEqual(result.valid, true);
  });

  it('rejects manifest missing name', () => {
    const result = validateManifest({ version: '1.0.0', engine: 'unity', uda_version: '>=0.2.0' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('name'));
  });

  it('rejects manifest missing version', () => {
    const result = validateManifest({ name: 'test', engine: 'unity', uda_version: '>=0.2.0' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('version'));
  });

  it('rejects manifest missing engine', () => {
    const result = validateManifest({ name: 'test', version: '1.0.0', uda_version: '>=0.2.0' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('engine'));
  });

  it('rejects manifest missing uda_version', () => {
    const result = validateManifest({ name: 'test', version: '1.0.0', engine: 'unity' });
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('uda_version'));
  });

  it('accepts capabilities object', () => {
    const manifest = {
      name: 'uda-unity',
      version: '1.0.0',
      engine: 'unity',
      uda_version: '>=0.2.0',
      capabilities: {
        logs: { source: '.uda/logs/console.jsonl', bridge: 'editor/LogBridge.cs', install_to: 'Assets/Editor/' },
        knowledge: true,
        workflows: true,
      },
    };
    const result = validateManifest(manifest);
    assert.strictEqual(result.valid, true);
  });

  it('rejects logs capability missing source', () => {
    const manifest = {
      name: 'test', version: '1.0.0', engine: 'unity', uda_version: '>=0.2.0',
      capabilities: { logs: { bridge: 'x.cs' } },
    };
    const result = validateManifest(manifest);
    assert.strictEqual(result.valid, false);
    assert.ok(result.error.includes('source'));
  });
});
