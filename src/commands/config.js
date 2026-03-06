// src/commands/config.js
import { loadConfig, saveConfig, getConfigValue, setConfigValue } from '../core/config.js';
import { validateConfigKey } from '../core/validators.js';

export async function handleConfig(key, value) {
  const root = process.cwd();

  // Validate config key format if provided
  if (key) {
    const v = validateConfigKey(key);
    if (!v.valid) {
      console.error(`✘ ${v.error}`);
      process.exitCode = 1;
      return;
    }
  }

  let config;
  try {
    config = await loadConfig(root);
  } catch (err) {
    console.error(`✘ Failed to load config: ${err.message}`);
    console.error('  Run `uda init` to initialize the project.');
    process.exitCode = 1;
    return;
  }

  // No key — list all config
  if (!key) {
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  // Key only — get value
  if (value === undefined) {
    const result = getConfigValue(config, key);
    if (result === undefined) {
      console.error(`✘ Key "${key}" not found`);
      process.exitCode = 1;
      return;
    }
    console.log(typeof result === 'object' ? JSON.stringify(result, null, 2) : result);
    return;
  }

  // Key + value — set value
  try {
    setConfigValue(config, key, value);
    await saveConfig(root, config);
    console.log(`✔ ${key} = ${JSON.stringify(getConfigValue(config, key))}`);
  } catch (err) {
    console.error(`✘ Failed to save config: ${err.message}`);
    process.exitCode = 1;
  }
}
