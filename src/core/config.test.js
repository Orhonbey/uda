// src/core/config.test.js
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { mkdtemp, rm, readFile } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { initProject } from './init.js';
import { loadConfig, saveConfig, getConfigValue, setConfigValue } from './config.js';

describe('config', () => {
  let testDir;

  before(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'uda-config-'));
    await initProject(testDir);
  });

  after(async () => {
    await rm(testDir, { recursive: true });
  });

  it('loadConfig reads config.json', async () => {
    const config = await loadConfig(testDir);
    assert.strictEqual(config.version, '0.1.0');
    assert.ok(Array.isArray(config.adapters));
  });

  it('saveConfig persists to disk', async () => {
    const config = await loadConfig(testDir);
    config.language = 'tr';
    await saveConfig(testDir, config);

    const raw = JSON.parse(await readFile(join(testDir, '.uda/config.json'), 'utf8'));
    assert.strictEqual(raw.language, 'tr');

    // Reset
    config.language = 'en';
    await saveConfig(testDir, config);
  });

  it('getConfigValue with dot notation', () => {
    const config = { rag: { chunk_size: 512, nested: { deep: 'value' } } };
    assert.strictEqual(getConfigValue(config, 'rag.chunk_size'), 512);
    assert.strictEqual(getConfigValue(config, 'rag.nested.deep'), 'value');
  });

  it('getConfigValue returns undefined for missing keys', () => {
    const config = { rag: { chunk_size: 512 } };
    assert.strictEqual(getConfigValue(config, 'rag.missing'), undefined);
    assert.strictEqual(getConfigValue(config, 'nonexistent.path'), undefined);
  });

  it('setConfigValue with dot notation', () => {
    const config = { rag: { chunk_size: 512 } };
    setConfigValue(config, 'rag.chunk_size', '1024');
    assert.strictEqual(config.rag.chunk_size, 1024);
  });

  it('setConfigValue creates nested objects', () => {
    const config = {};
    setConfigValue(config, 'a.b.c', 'hello');
    assert.strictEqual(config.a.b.c, 'hello');
  });

  it('type conversion — boolean', () => {
    const config = {};
    setConfigValue(config, 'flag', 'true');
    assert.strictEqual(config.flag, true);
    setConfigValue(config, 'flag', 'false');
    assert.strictEqual(config.flag, false);
  });

  it('type conversion — number', () => {
    const config = {};
    setConfigValue(config, 'count', '42');
    assert.strictEqual(config.count, 42);
    setConfigValue(config, 'ratio', '3.14');
    assert.strictEqual(config.ratio, 3.14);
  });

  it('type conversion — array', () => {
    const config = {};
    setConfigValue(config, 'list', '[a,b,c]');
    assert.deepStrictEqual(config.list, ['a', 'b', 'c']);
  });

  it('type conversion — null', () => {
    const config = {};
    setConfigValue(config, 'val', 'null');
    assert.strictEqual(config.val, null);
  });

  it('type conversion — plain string stays string', () => {
    const config = {};
    setConfigValue(config, 'name', 'hello');
    assert.strictEqual(config.name, 'hello');
  });
});
