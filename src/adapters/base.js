// src/adapters/base.js
export class BaseAdapter {
  constructor() {
    if (new.target === BaseAdapter) {
      throw new Error('BaseAdapter is abstract');
    }
  }

  get name() { throw new Error('Not implemented'); }

  detect(projectRoot) { throw new Error('Not implemented'); }

  generate(knowledge, workflows, agents, projectRoot) { throw new Error('Not implemented'); }
}
