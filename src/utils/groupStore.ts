import { Group, Contact, SentHistoryItem } from "@/types/group";
import { supabase } from "@/integrations/supabase/client"; // Import Supabase client

const STORAGE_KEY = "dyad_groups";
const DIRECT_MESSAGES_GROUP_NAME = "Direct Messages"; // Special group name

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

// NEW: Function to get or create the special "Direct Messages" group
export const getOrCreateDirectMessagesGroup = (): Group => {
  const groups = loadGroups();
  let directMessagesGroup = groups.find(g => g.name === DIRECT_MESSAGES_GROUP_NAME);

  if (!directMessagesGroup) {
    directMessagesGroup = {
      id: uuid(),
      name: DIRECT_MESSAGES_GROUP_NAME,
      contacts: [],
      sentHistory: [],
    };
    groups.push(directMessagesGroup);
    saveGroups(groups);
  }
  return directMessagesGroup;
};

// NEW: Function to get all contacts from all groups
export const getAllContacts = (): Contact[] => {
  const groups = loadGroups();
  const allContacts: Contact[] = [];
  const seenPhones = new Set<string>(); // To avoid duplicate contacts by phone number

  for (const group of groups) {
    for (const contact of group.contacts) {
      const normalizedPhone = normalizePhone(contact.phone);
      if (normalizedPhone && !seenPhones.has(normalizedPhone)) {
        allContacts.push(contact);
        seenPhones.add(normalizedPhone);
      }
    }
  }
  return allContacts;
};


const normalizePhone = (phone: string): string => {
  // WhatsApp expects international format without plus and only digits.
  // We strip non-digits.
  let digits = (phone || "").replace(/\D+/g, "");

  // If it starts with '0' and is a typical SA mobile length (9-10 digits after stripping '0'),
  // assume it's a local SA number and prepend '27'.
  // Example: "0821234567" -> "821234567" -> "27821234567"
  // Example: "821234567" -> "27821234567"
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

// Removed formatWhatsAppLink as it's no longer used for direct API sending.
// export const formatWhatsAppLink = (phone: string, message: string): string => {
//   const normalized = normalizePhone(phone);
//   const text = encodeURIComponent(message || "");
//   return `https://wa.me/${normalized}?text=${text}`;
// };

// Renamed and modified to only record history, not clear contacts
export const recordGroupMessageSent = async ( // Made async
  groupId: string,
  message: string,
  contactsSent: Array<{ name: string; phone: string }>,
  status: 'sent' | 'failed' | 'pending' = 'pending', // NEW: Add status parameter
  errorMessage?: string // NEW: Add errorMessage parameter
): Promise<{ updated?: Group }> => { // Return a Promise
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  // Do not return early if user is not authenticated; still save to local storage.
  if (!user) {
    console.warn("User not authenticated. Supabase history will not be saved.");
  }

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
    status: status, // NEW: Use the passed status
    error_message: errorMessage, // NEW: Use the passed error message
  }));

  group.sentHistory = [...historyItems, ...group.sentHistory];
  saveGroups(groups);

  // --- NEW: Save to Supabase ---
  if (user) {
    try {
      // Find or create the group in Supabase
      let supabaseGroupId: string | undefined;
      const { data: existingGroup, error: existingGroupErr } = await supabase
        .from("avon_work_groups")
        .select("id")
        .eq("user_id", user.id)
        .eq("name", group.name)
        .limit(1)
        .maybeSingle();

      if (existingGroupErr) throw existingGroupErr;

      if (existingGroup) {
        supabaseGroupId = existingGroup.id;
      } else {
        // If group doesn't exist in Supabase, create it
        const { data: newSupabaseGroup, error: newGroupErr } = await supabase
          .from("avon_work_groups")
          .insert({ user_id: user.id, name: group.name })
          .select("id")
          .single();
        if (newGroupErr) throw newGroupErr;
        supabaseGroupId = newSupabaseGroup.id;
      }

      if (supabaseGroupId) {
        const supabaseHistoryInserts = historyItems.map((item) => ({
          user_id: user.id,
          avon_work_group_id: supabaseGroupId,
          contact_name: item.name,
          phone_number: item.phone,
          sent_at: item.sentAt,
          message: item.message,
          status: item.status, // NEW: Include status
          error_message: item.error_message, // NEW: Include error_message
        }));

        const { error: insertHistoryErr } = await supabase
          .from("avon_work_sent_history")
          .insert(supabaseHistoryInserts);

        if (insertHistoryErr) throw insertHistoryErr;
        console.log(`Saved ${supabaseHistoryInserts.length} history items to Supabase.`);
      }
    } catch (dbError: any) {
      console.error("Failed to save sent history to Supabase:", dbError.message);
      // Optionally, show an error toast here if you want to notify the user about the DB save failure
    }
  }
  // --- END NEW ---

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