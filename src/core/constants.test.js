// src/core/constants.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { udaPaths, DEFAULT_PLUGINS } from './constants.js';

describe('udaPaths logs', () => {
  it('includes logs path', () => {
    const paths = udaPaths('/tmp/test');
    assert.strictEqual(paths.logs, '/tmp/test/.uda/logs');
  });
});

describe('DEFAULT_PLUGINS', () => {
  it('includes threejs plugin URL', () => {
    assert.strictEqual(
      DEFAULT_PLUGINS.threejs,
      'https://github.com/Orhonbey/uda-threejs-plugin.git'
    );
  });
});
