// src/adapters/claude.js
import { existsSync } from 'fs';
import { join } from 'path';

export class ClaudeAdapter {
  get name() { return 'claude'; }

  detect(projectRoot) {
    return (
      existsSync(join(projectRoot, 'CLAUDE.md')) ||
      existsSync(join(projectRoot, '.claude'))
    );
  }

  generate(knowledge, workflows, agents, projectRoot) {
    const files = {};

    // Generate CLAUDE.md
    files['CLAUDE.md'] = this._generateClaudeMd(knowledge, workflows);

    // Generate skills
    for (const wf of workflows) {
      const skillPath = `.claude/commands/uda/${wf.name}.md`;
      files[skillPath] = this._generateSkill(wf);
    }

    // Generate agents
    for (const agent of agents) {
      const agentPath = `.claude/agents/uda-${agent.name}.md`;
      files[agentPath] = this._generateAgent(agent);
    }

    return files;
  }

  _generateClaudeMd(knowledge, workflows) {
    const lines = ['# CLAUDE.md', ''];

    if (knowledge.project) {
      lines.push('## Project Info');
      if (knowledge.project.name) lines.push(`- **Project**: ${knowledge.project.name}`);
      if (knowledge.project.engine) lines.push(`- **Engine**: ${knowledge.project.engine}`);
      if (knowledge.project.version) lines.push(`- **Version**: ${knowledge.project.version}`);
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
      lines.push('## Architectural Decisions');
      for (const dec of knowledge.decisions) {
        lines.push(`- ${dec}`);
      }
      lines.push('');
    }

    if (workflows.length > 0) {
      lines.push('## UDA Commands');
      lines.push('This project uses UDA (Universal Dev AI).');
      for (const wf of workflows) {
        lines.push(`- \`/uda:${wf.name}\` — ${wf.description}`);
      }
      lines.push('');
    }

    return lines.join('\n');
  }

  _generateSkill(workflow) {
    const lines = [
      '---',
      `description: ${workflow.description}`,
      '---',
      '',
      `# ${workflow.name}`,
      '',
    ];

    if (workflow.steps) {
      for (const step of workflow.steps) {
        lines.push(`## ${step.name || step.id}`);
        if (step.questions) {
          for (const q of step.questions) {
            lines.push(`- "${q}"`);
          }
        }
        lines.push('');
      }
    }

    return lines.join('\n');
  }

  _generateAgent(agent) {
    return [
      '---',
      `name: uda-${agent.name}`,
      `description: ${agent.description}`,
      `tools: ${agent.tools || 'Read, Grep, Glob'}`,
      `model: ${agent.model || 'sonnet'}`,
      '---',
      '',
      agent.prompt || `You are a ${agent.description}.`,
      '',
    ].join('\n');
  }
}
