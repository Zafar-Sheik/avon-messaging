import { ScheduleItem, TaskStatus, TaskType } from "@/types/scheduler";

const STORAGE_KEY = "scheduler_items";

function loadAll(): ScheduleItem[] {
  const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as ScheduleItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAll(items: ScheduleItem[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `s_${Math.random().toString(36).slice(2, 10)}_${Date.now()}`;
}

export function getSchedules(): ScheduleItem[] {
  return loadAll();
}

export function addSchedule(input: {
  date: Date;
  type: TaskType;
  location?: string;
  members: string[];
  status: TaskStatus;
  comments?: string;
  completed?: boolean;
}): ScheduleItem {
  const items = loadAll();
  const completed = Boolean(input.completed);
  const status: TaskStatus = completed ? "Completed" : input.status;

  const item: ScheduleItem = {
    id: newId(),
    dateISO: input.date.toISOString(),
    type: input.type,
    location: input.location?.trim() || "",
    members: input.members.map((m) => m.trim()).filter(Boolean),
    status,
    comments: input.comments?.trim() || "",
    completed,
    createdAtISO: new Date().toISOString(),
  };

  items.unshift(item);
  saveAll(items);
  return item;
}

export function toggleCompleted(id: string): ScheduleItem | undefined {
  const items = loadAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const current = items[idx];
  const nextCompleted = !current.completed;
  const nextStatus: TaskStatus = nextCompleted ? "Completed" : (current.status === "Completed" ? "Pending" : current.status);

  const updated: ScheduleItem = { ...current, completed: nextCompleted, status: nextStatus };
  items[idx] = updated;
  saveAll(items);
  return updated;
}

export function updateStatus(id: string, status: TaskStatus): ScheduleItem | undefined {
  const items = loadAll();
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return undefined;
  const current = items[idx];
  const completed = status === "Completed";
  const updated: ScheduleItem = { ...current, status, completed };
  items[idx] = updated;
  saveAll(items);
  return updated;
}

export function deleteSchedule(id: string): boolean {
  const items = loadAll();
  const next = items.filter((i) => i.id !== id);
  if (next.length === items.length) return false;
  saveAll(next);
  return true;
}