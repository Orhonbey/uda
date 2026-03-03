import { existsSync } from 'fs';
import { join } from 'path';

export class CursorAdapter {
  get name() { return 'cursor'; }

  detect(projectRoot) {
    return (
      existsSync(join(projectRoot, '.cursorrules')) ||
      existsSync(join(projectRoot, '.cursor'))
    );
  }

  generate(knowledge, workflows, agents, projectRoot) {
    const files = {};
    files['.cursorrules'] = this._generateRules(knowledge);
    return files;
  }

  _generateRules(knowledge) {
    const lines = [];

    if (knowledge.project) {
      lines.push(`Project: ${knowledge.project.name || 'Unknown'}`);
      lines.push(`Engine: ${knowledge.project.engine || 'Unknown'}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      for (const conv of knowledge.conventions) {
        lines.push(`- ${conv}`);
      }
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Architecture');
      for (const dec of knowledge.decisions) {
        lines.push(`- ${dec}`);
      }
    }

    return lines.join('\n');
  }
}
