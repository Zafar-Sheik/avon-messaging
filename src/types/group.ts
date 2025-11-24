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
  status: 'sent' | 'failed' | 'pending'; // NEW: Status of the message send
  error_message?: string; // NEW: Error message if sending failed
};

export type Group = {
  id: string;
  name: string;
  contacts: Contact[];
  sentHistory: SentHistoryItem[];
};