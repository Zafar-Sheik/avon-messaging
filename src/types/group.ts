export type Contact = {
  id: string;
  name: string;
  phone: string; // should be in international format digits only (no +)
};

export type SentHistoryItem = {
  id: string;
  name: string;
  phone: string;
  sentAt: string; // ISO string
  message: string;
};

export type Group = {
  id: string;
  name: string;
  contacts: Contact[];
  sentHistory: SentHistoryItem[];
};