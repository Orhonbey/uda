// src/commands/config.js
import { loadConfig, saveConfig, getConfigValue, setConfigValue } from '../core/config.js';

export async function handleConfig(key, value) {
  const root = process.cwd();

  const config = await loadConfig(root);

  // No key — list all config
  if (!key) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  // Key only — get value
  if (value === undefined) {
    const result = getConfigValue(config, key);
    if (result === undefined) {
      console.log(`✘ Key "${key}" not found`);
      process.exitCode = 1;
      return;
    }
    console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    return;
  }

  // Key + value — set value
  setConfigValue(config, key, value);
  await saveConfig(root, config);
  console.log(`✔ ${key} = ${JSON.stringify(getConfigValue(config, key))}`);
}
