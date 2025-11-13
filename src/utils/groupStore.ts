import { Group, Contact, SentHistoryItem } from "@/types/group";

const STORAGE_KEY = "dyad_groups";

const uuid = () => {
  if ("crypto" in window && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const loadGroups = (): Group[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Group[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveGroups = (groups: Group[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
};

export const getGroups = (): Group[] => loadGroups();

export const getGroupById = (groupId: string): Group | undefined => {
  return loadGroups().find((g) => g.id === groupId);
};

export const createGroup = (name: string): Group => {
  const groups = loadGroups();
  const newGroup: Group = {
    id: uuid(),
    name: name.trim(),
    contacts: [],
    sentHistory: [],
  };
  groups.push(newGroup);
  saveGroups(groups);
  return newGroup;
};

const normalizePhone = (phone: string): string => {
  // WhatsApp expects international format without plus and only digits.
  // We strip non-digits. If a leading '+' existed, it's removed.
  return (phone || "").replace(/\D+/g, "");
};

export const addContactsToGroup = (
  groupId: string,
  incoming: Array<{ name: string; phone: string }>
): Group | undefined => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return undefined;

  const existingPhones = new Set(group.contacts.map((c) => normalizePhone(c.phone)));

  const toAdd: Contact[] = [];
  for (const raw of incoming) {
    const phone = normalizePhone(raw.phone);
    if (!phone) continue;
    if (existingPhones.has(phone)) continue;
    existingPhones.add(phone);
    toAdd.push({
      id: uuid(),
      name: (raw.name || "").trim(),
      phone,
    });
  }

  if (toAdd.length > 0) {
    group.contacts = [...group.contacts, ...toAdd];
    saveGroups(groups);
  }
  return group;
};

export const formatWhatsAppLink = (phone: string, message: string): string => {
  const normalized = normalizePhone(phone);
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${normalized}?text=${text}`;
};

export const sendGroupMessage = (
  groupId: string,
  message: string
): { links: string[]; updated?: Group } => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return { links: [] };

  const now = new Date().toISOString();
  const historyItems: SentHistoryItem[] = group.contacts.map((c) => ({
    id: uuid(),
    name: c.name,
    phone: normalizePhone(c.phone),
    sentAt: now,
    message: message || "",
  }));

  const links = group.contacts.map((c) => formatWhatsAppLink(c.phone, message));

  // Move contacts to sentHistory and clear current contacts
  group.sentHistory = [...historyItems, ...group.sentHistory];
  group.contacts = [];

  saveGroups(groups);

  return { links, updated: group };
};

export const deleteGroup = (groupId: string) => {
  const groups = loadGroups();
  const next = groups.filter((g) => g.id !== groupId);
  saveGroups(next);
};

export const clearGroupHistory = (groupId: string) => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  group.sentHistory = [];
  saveGroups(groups);
};