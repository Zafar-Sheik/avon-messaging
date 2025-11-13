export type Reminder = {
  id: string;
  title: string;
  dueAt?: string; // ISO string
  done: boolean;
};

const STORAGE_KEY = "dyad_reminders";

const uuid = () => {
  if ("crypto" in window && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const load = (): Reminder[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Reminder[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const save = (items: Reminder[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

export const getReminders = (): Reminder[] => load();

export const addReminder = (title: string, dueAt?: string): Reminder => {
  const items = load();
  const reminder: Reminder = {
    id: uuid(),
    title: title.trim(),
    dueAt: dueAt || undefined,
    done: false,
  };
  items.unshift(reminder);
  save(items);
  return reminder;
};

export const toggleReminderDone = (id: string) => {
  const items = load();
  const idx = items.findIndex((r) => r.id === id);
  if (idx >= 0) {
    items[idx] = { ...items[idx], done: !items[idx].done };
    save(items);
  }
};

export const deleteReminder = (id: string) => {
  const items = load().filter((r) => r.id !== id);
  save(items);
};

export const clearAllReminders = () => {
  localStorage.removeItem(STORAGE_KEY);
};