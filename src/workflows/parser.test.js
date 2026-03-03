// src/workflows/parser.test.js
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseWorkflow } from './parser.js';

describe('parseWorkflow', () => {
  it('parses a workflow YAML string', () => {
    const yaml = `
name: debug
description: Systematic debugging
trigger: "bug, error, crash"
engine: null
steps:
  - id: define
    name: Bug Definition
    type: ask
    questions:
      - "What should happen?"
      - "What is happening?"
  - id: fix
    name: Apply Fix
    type: auto
    actions:
      - apply_fix
      - git_commit: "fix: bug"
`;
    const wf = parseWorkflow(yaml);
    assert.strictEqual(wf.name, 'debug');
    assert.strictEqual(wf.steps.length, 2);
    assert.strictEqual(wf.steps[0].type, 'ask');
    assert.deepStrictEqual(wf.steps[0].questions, ['What should happen?', 'What is happening?']);
  });
});
