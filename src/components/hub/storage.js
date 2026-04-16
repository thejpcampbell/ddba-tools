import { DEFAULT_TOOLS, STORAGE_KEY } from "./constants";

export function loadTools() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved  = JSON.parse(raw);
      const hardIds = DEFAULT_TOOLS.map(t => t.id);
      const userAdded = saved.filter(t => !hardIds.includes(t.id));
      return [...DEFAULT_TOOLS, ...userAdded];
    }
  } catch {}
  return DEFAULT_TOOLS;
}

export function saveTools(tools) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tools)); } catch {}
}
