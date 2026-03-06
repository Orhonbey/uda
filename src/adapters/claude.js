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

  generate(knowledge, workflows, agents, projectRoot, capabilities = {}) {
    const files = {};
    files['CLAUDE.md'] = this._generateClaudeMd(knowledge, workflows, capabilities);

    for (const wf of workflows) {
      const skillPath = `.claude/commands/uda/${wf.name}.md`;
      files[skillPath] = this._generateSkill(wf);
    }

    for (const agent of agents) {
      const agentPath = `.claude/agents/uda-${agent.name}.md`;
      files[agentPath] = this._generateAgent(agent);
    }

    return files;
  }

  _generateClaudeMd(knowledge, workflows, capabilities) {
    const lines = ['# CLAUDE.md', ''];

    // Project info
    if (knowledge.project) {
      lines.push('## Project Info');
      if (knowledge.project.name) lines.push(`- **Project**: ${knowledge.project.name}`);
      if (knowledge.project.engine) lines.push(`- **Engine**: ${knowledge.project.engine}`);
      if (knowledge.project.version) lines.push(`- **Version**: ${knowledge.project.version}`);
      lines.push('');
    }

    if (knowledge.conventions?.length > 0) {
      lines.push('## Conventions');
      for (const conv of knowledge.conventions) lines.push(`- ${conv}`);
      lines.push('');
    }

    if (knowledge.decisions?.length > 0) {
      lines.push('## Architectural Decisions');
      for (const dec of knowledge.decisions) lines.push(`- ${dec}`);
      lines.push('');
    }

    // UDA AI-native instructions
    lines.push('## UDA (Universal Dev AI)');
    lines.push('');
    lines.push('This project uses UDA for AI-assisted development. Follow these rules:');
    lines.push('');

    // Knowledge base instructions
    lines.push('### Knowledge Base');
    lines.push('- Engine knowledge is in `.uda/knowledge/`');
    lines.push('- For engine questions, check these files FIRST');
    lines.push('- For broader searches: `npx uda-cli search "query"`');
    lines.push('');

    // Log instructions (only if capability exists)
    if (capabilities.logs) {
      lines.push('### Console Logs');
      lines.push(`- Log file: \`${capabilities.logs.source || '.uda/logs/console.jsonl'}\``);
      lines.push('- Read logs: `npx uda-cli logs --errors --last 50`');
      lines.push('- When user mentions logs, errors, or console issues, run this command');
      lines.push('');
    }

    // Available commands
    lines.push('### Available Commands');
    lines.push('- `npx uda-cli search "query"` — search knowledge base');
    if (capabilities.logs) {
      lines.push('- `npx uda-cli logs [--errors|--warnings] [--last N]` — read engine logs');
    }
    lines.push('- `npx uda-cli plugin add <repo>` — add new plugin');
    lines.push('- `npx uda-cli sync` — regenerate AI tool files');
    lines.push('');

    // Workflow skills
    if (workflows.length > 0) {
      lines.push('### UDA Skills');
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
