export type CompanyProfile = {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  address?: string;
};

const STORAGE_KEY = "companyProfile";

export const getCompanyProfile = (): CompanyProfile | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as CompanyProfile) : null;
};

export const saveCompanyProfile = (profile: CompanyProfile): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
};

export const clearCompanyProfile = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};