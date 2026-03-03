// src/workflows/parser.js
import YAML from 'yaml';

export function parseWorkflow(yamlString) {
  return YAML.parse(yamlString);
}

export function workflowToSkillMd(workflow) {
  const lines = [
    '---',
    `description: ${workflow.description}`,
    '---',
    '',
    `# ${workflow.name}`,
    '',
  ];

  for (const step of workflow.steps || []) {
    lines.push(`## ${step.name || step.id}`);

    if (step.type === 'ask' && step.questions) {
      lines.push('Ask the user:');
      for (const q of step.questions) {
        lines.push(`- "${q}"`);
      }
    }

    if (step.type === 'auto' && step.actions) {
      lines.push('Actions:');
      for (const action of step.actions) {
        if (typeof action === 'string') {
          lines.push(`- ${action}`);
        } else {
          const key = Object.keys(action)[0];
          lines.push(`- ${key}: ${JSON.stringify(action[key])}`);
        }
      }
    }

    if (step.type === 'agent') {
      lines.push(`Delegate to agent: **${step.agent}**`);
      if (step.output) lines.push(`Expected output: ${step.output}`);
    }

    lines.push('');
  }

  return lines.join('\n');
}
