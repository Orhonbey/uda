// src/core/constants.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { udaPaths } from './constants.js';

describe('udaPaths logs', () => {
  it('includes logs path', () => {
    const paths = udaPaths('/tmp/test');
    assert.strictEqual(paths.logs, '/tmp/test/.uda/logs');
  });
});
