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

export const createGroup = (name: string): Group | undefined => {
  const trimmedName = name.trim();
  if (!trimmedName) return undefined;

  const groups = loadGroups();
  if (groups.some(g => g.name.toLowerCase() === trimmedName.toLowerCase())) {
    // Group with this name already exists
    return undefined;
  }

  const newGroup: Group = {
    id: uuid(),
    name: trimmedName,
    contacts: [],
    sentHistory: [],
  };
  groups.push(newGroup);
  saveGroups(groups);
  return newGroup;
};

const normalizePhone = (phone: string): string => {
  // WhatsApp expects international format without plus and only digits.
  // We strip non-digits.
  let digits = (phone || "").replace(/\D+/g, "");

  // If it starts with '0' and is a typical SA mobile length (9-10 digits after stripping '0'),
  // assume it's a local SA number and prepend '27'.
  // Example: "0821234567" -> "821234567" -> "27821234567"
  // Example: "821234567" -> "27821234567"
  // If it already starts with '27', leave it.
  if (digits.startsWith("0") && digits.length >= 9 && digits.length <= 10) {
    digits = digits.substring(1); // Remove leading '0'
  }
  if (digits.length >= 9 && digits.length <= 10 && !digits.startsWith("27")) {
    digits = `27${digits}`;
  }
  
  return digits;
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

export const addContactToGroup = (
  groupId: string,
  contact: { name: string; phone: string }
): Group | undefined => {
  return addContactsToGroup(groupId, [contact]);
};

export const updateContactInGroup = (
  groupId: string,
  contactId: string,
  updates: { name?: string; phone?: string }
): Group | undefined => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return undefined;

  const idx = group.contacts.findIndex((c) => c.id === contactId);
  if (idx === -1) return undefined;

  const current = group.contacts[idx];
  const nextName = (updates.name ?? current.name ?? "").trim();
  const nextPhone = normalizePhone(updates.phone ?? current.phone ?? "");
  if (!nextPhone) return undefined;

  const duplicate = group.contacts.some(
    (c) => c.id !== contactId && normalizePhone(c.phone) === nextPhone
  );
  if (duplicate) return undefined;

  group.contacts[idx] = { ...current, name: nextName, phone: nextPhone };
  saveGroups(groups);
  return group;
};

export const deleteContactFromGroup = (
  groupId: string,
  contactId: string
): Group | undefined => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return undefined;

  const nextContacts = group.contacts.filter((c) => c.id !== contactId);
  if (nextContacts.length === group.contacts.length) return group;

  group.contacts = nextContacts;
  saveGroups(groups);
  return group;
};

export const formatWhatsAppLink = (phone: string, message: string): string => {
  const normalized = normalizePhone(phone);
  const text = encodeURIComponent(message || "");
  return `https://wa.me/${normalized}?text=${text}`;
};

// Renamed and modified to only record history, not clear contacts
export const recordGroupMessageSent = (
  groupId: string,
  message: string,
  contactsSent: Array<{ name: string; phone: string }>
): { updated?: Group } => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return {};

  const now = new Date().toISOString();
  const historyItems: SentHistoryItem[] = contactsSent.map((c) => ({
    id: uuid(),
    name: c.name,
    phone: normalizePhone(c.phone),
    sentAt: now,
    message: message || "",
  }));

  group.sentHistory = [...historyItems, ...group.sentHistory];
  saveGroups(groups);

  return { updated: group };
};

export const deleteGroup = (groupId: string) => {
  const groups = loadGroups();
  const next = groups.filter((g) => g.id !== groupId);
  saveGroups(next);
};

export const updateGroupName = (groupId: string, name: string): Group | undefined => {
  const nextName = (name || "").trim();
  if (!nextName) return undefined;

  const groups = loadGroups();
  // Check for duplicate names, excluding the current group
  if (groups.some(g => g.id !== groupId && g.name.toLowerCase() === nextName.toLowerCase())) {
    return undefined; // Duplicate name found
  }

  const group = groups.find((g) => g.id === groupId);
  if (!group) return undefined;

  group.name = nextName;
  saveGroups(groups);
  return group;
};

export const clearGroupHistory = (groupId: string) => {
  const groups = loadGroups();
  const group = groups.find((g) => g.id === groupId);
  if (!group) return;
  group.sentHistory = [];
  saveGroups(groups);
};

export const clearAllGroups = () => {
  localStorage.removeItem(STORAGE_KEY);
};