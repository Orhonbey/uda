// src/adapters/registry.js
const adapters = [];

export function registerAdapter(adapter) {
  adapters.push(adapter);
}

export function getAdapter(name) {
  return adapters.find(a => a.name === name);
}

export function detectAdapters(projectRoot) {
  return adapters.filter(a => a.detect(projectRoot));
}

export function getAllAdapters() {
  return [...adapters];
}
