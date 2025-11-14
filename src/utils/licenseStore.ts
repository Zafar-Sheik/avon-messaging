const LICENSE_KEY_STORAGE_KEY = "app_license_key";

export const getLicenseKey = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(LICENSE_KEY_STORAGE_KEY);
};

export const saveLicenseKey = (key: string) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LICENSE_KEY_STORAGE_KEY, key);
};

export const clearLicenseKey = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(LICENSE_KEY_STORAGE_KEY);
};