import { loadData, saveData } from './storage';

export const HISTORY_KEY = '@history';

export async function getHistory() {
  const data = await loadData(HISTORY_KEY);
  return Array.isArray(data) ? data : [];
}

export async function addHistory(entry) {
  const current = await getHistory();
  const next = [
    {
      id: String(Date.now()),
      date: new Date().toISOString(),
      ...entry,
    },
    ...current,
  ].slice(0, 80);
  await saveData(HISTORY_KEY, next);
  return next;
}
