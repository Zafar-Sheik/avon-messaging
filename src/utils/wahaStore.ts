export type WahaConfig = {
  apiKey: string;
  baseUrl: string;
  sessionName: string;
};

const STORAGE_KEY = "wahaConfig";

export const getWahaConfig = (): WahaConfig | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as WahaConfig) : null;
};

export const saveWahaConfig = (config: WahaConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

export const clearWahaConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};