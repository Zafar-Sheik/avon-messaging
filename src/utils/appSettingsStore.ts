export type AppSettings = {
  allowStockBelowCost: boolean;
  dontSellBelowCost: boolean;
  slipMessage1?: string;
  slipMessage2?: string;
  slipMessage3?: string;
  wahaBaseUrl?: string; // NEW: WhatsApp API Base URL
  wahaApiKey?: string; // NEW: WhatsApp API Key
  wahaSessionName?: string; // NEW: WhatsApp Session Name
  wahaPhoneNumber?: string; // NEW: WhatsApp Phone Number
};

const STORAGE_KEY = "appSettings";

const defaultSettings: AppSettings = {
  allowStockBelowCost: true,
  dontSellBelowCost: false,
  slipMessage1: "",
  slipMessage2: "",
  slipMessage3: "",
  wahaBaseUrl: "", // Default empty
  wahaApiKey: "", // Default empty
  wahaSessionName: "", // Default empty
  wahaPhoneNumber: "", // Default empty
};

export const getAppSettings = (): AppSettings => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultSettings;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveAppSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

export const clearAppSettings = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};