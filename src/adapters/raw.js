export class RawAdapter {
  get name() { return 'raw'; }
  detect() { return true; } // always available

  generate(knowledge, workflows, agents) {
    const lines = ['# Project Context (UDA Generated)', ''];

    if (knowledge.project) {
      lines.push(`## Project: ${knowledge.project.name || 'Unknown'}`);
      lines.push(`Engine: ${knowledge.project.engine || 'N/A'}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      knowledge.conventions.forEach(c => lines.push(`- ${c}`));
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Decisions');
      knowledge.decisions.forEach(d => lines.push(`- ${d}`));
      lines.push('');
    }

    if (workflows.length > 0) {
      lines.push('## Available Workflows');
      workflows.forEach(w => lines.push(`- **${w.name}**: ${w.description}`));
      lines.push('');
    }

    return { '.uda/.generated/full-context.md': lines.join('\n') };
  }
}
