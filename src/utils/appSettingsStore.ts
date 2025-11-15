export type AppSettings = {
  allowStockBelowCost: boolean;
  dontSellBelowCost: boolean;
  slipMessage1?: string;
  slipMessage2?: string;
  slipMessage3?: string;
};

const STORAGE_KEY = "appSettings";

const defaultSettings: AppSettings = {
  allowStockBelowCost: true,
  dontSellBelowCost: false,
  slipMessage1: "",
  slipMessage2: "",
  slipMessage3: "",
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