"use client";

// Removed supabase import as it's no longer used for settings without authentication
// import { supabase } from "@/integrations/supabase/client";
// import { logClientError } from "@/utils/log"; // Removed logClientError as it depends on user

export type AppSettings = {
  allowStockBelowCost: boolean;
  dontSellBelowCost: boolean;
  slipMessage1?: string;
  slipMessage2?: string;
  slipMessage3?: string;
  wahaBaseUrl?: string;
  wahaApiKey?: string;
  wahaSessionName?: string;
  wahaPhoneNumber?: string;
};

const STORAGE_KEY = "appSettings";

const defaultSettings: AppSettings = {
  allowStockBelowCost: true,
  dontSellBelowCost: false,
  slipMessage1: "",
  slipMessage2: "",
  slipMessage3: "",
  wahaBaseUrl: "",
  wahaApiKey: "",
  wahaSessionName: "",
  wahaPhoneNumber: "",
};

export const getAppSettings = async (): Promise<AppSettings> => {
  // Removed user check and Supabase fetch. Now uses local storage as primary.
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const stored = JSON.parse(raw) as AppSettings;
      return { ...defaultSettings, ...stored }; // Merge with defaults to ensure all fields exist
    }
  } catch (err) {
    console.error("getAppSettings: Failed to parse local storage settings:", err);
    // Fallback to default if local storage is corrupted
  }
  return defaultSettings;
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  // Removed user check and Supabase upsert. Now saves to local storage.
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    console.log("saveAppSettings: Successfully saved app settings to local storage.");
  } catch (err) {
    console.error("saveAppSettings: Failed to save app settings to local storage:", err);
    throw err;
  }
};

export const clearAppSettings = async (): Promise<void> => {
  // Removed user check and Supabase delete. Now clears from local storage.
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    console.log("clearAppSettings: Successfully cleared app settings from local storage.");
  } catch (err) {
    console.error("clearAppSettings: Failed to clear app settings from local storage:", err);
    throw err;
  }
};