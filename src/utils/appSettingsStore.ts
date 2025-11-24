"use client";

import { supabase } from "@/integrations/supabase/client";
import { logClientError } from "@/utils/log";

export type AppSettings = {
  allowStockBelowCost: boolean;
  dontSellBelowCost: boolean;
  slipMessage1?: string;
  slipMessage2?: string;
  slipMessage3?: string;
  wahaBaseUrl?: string; // WhatsApp API Base URL
  wahaApiKey?: string; // WhatsApp API Key
  wahaSessionName?: string; // WhatsApp Session Name
  wahaPhoneNumber?: string; // WhatsApp Phone Number
};

const STORAGE_KEY = "appSettings"; // Still used for non-Supabase settings if any, or as a fallback.

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("getAppSettings: No authenticated user found. Returning default app settings.");
    return defaultSettings;
  }

  console.log("getAppSettings: Attempting to fetch settings for user_id:", user.id);

  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('allow_stock_below_cost, dont_sell_below_cost, slip_message1, slip_message2, slip_message3, waha_base_url, waha_api_key, waha_session_name, waha_phone_number')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 means 'No rows found'
      console.error("getAppSettings: Failed to fetch app settings from Supabase:", error);
      logClientError("Failed to fetch app settings from Supabase", 'error', { functionName: 'getAppSettings', supabaseError: error });
      return defaultSettings;
    }

    if (data) {
      console.log("getAppSettings: Successfully fetched data:", data);
      return {
        allowStockBelowCost: data.allow_stock_below_cost ?? defaultSettings.allowStockBelowCost,
        dontSellBelowCost: data.dont_sell_below_cost ?? defaultSettings.dontSellBelowCost,
        slipMessage1: data.slip_message1 ?? defaultSettings.slipMessage1,
        slipMessage2: data.slip_message2 ?? defaultSettings.slipMessage2,
        slipMessage3: data.slip_message3 ?? defaultSettings.slipMessage3,
        wahaBaseUrl: data.waha_base_url ?? defaultSettings.wahaBaseUrl,
        wahaApiKey: data.waha_api_key ?? defaultSettings.wahaApiKey,
        wahaSessionName: data.waha_session_name ?? defaultSettings.wahaSessionName,
        wahaPhoneNumber: data.waha_phone_number ?? defaultSettings.wahaPhoneNumber,
      };
    } else {
      console.log("getAppSettings: No existing settings found for user. Returning defaults.");
    }
  } catch (err: any) {
    console.error("getAppSettings: An unexpected error occurred while getting app settings:", err);
    logClientError("An unexpected error occurred while getting app settings", 'error', { functionName: 'getAppSettings', stack: err.stack });
  }

  return defaultSettings;
};

export const saveAppSettings = async (settings: AppSettings): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("saveAppSettings: Cannot save app settings: No authenticated user.");
    logClientError("Cannot save app settings: No authenticated user.", 'warn', { functionName: 'saveAppSettings' });
    return;
  }

  const payload = {
    user_id: user.id,
    allow_stock_below_cost: settings.allowStockBelowCost,
    dont_sell_below_cost: settings.dontSellBelowCost,
    slip_message1: settings.slipMessage1,
    slip_message2: settings.slipMessage2,
    slip_message3: settings.slipMessage3,
    waha_base_url: settings.wahaBaseUrl,
    waha_api_key: settings.wahaApiKey,
    waha_session_name: settings.wahaSessionName,
    waha_phone_number: settings.wahaPhoneNumber,
    updated_at: new Date().toISOString(),
  };

  console.log("saveAppSettings: Attempting to save payload for user_id:", user.id, "Payload:", payload);

  try {
    const { error } = await supabase
      .from('app_config')
      .upsert(payload, { onConflict: 'user_id' });

    if (error) {
      console.error("saveAppSettings: Failed to save app settings to Supabase:", error);
      logClientError("Failed to save app settings to Supabase", 'error', { functionName: 'saveAppSettings', supabaseError: error, payload });
      throw new Error(error.message);
    } else {
      console.log("saveAppSettings: Successfully saved app settings to Supabase.");
    }
  } catch (err: any) {
    console.error("saveAppSettings: An unexpected error occurred while saving app settings:", err);
    logClientError("An unexpected error occurred while saving app settings", 'error', { functionName: 'saveAppSettings', stack: err.stack });
    throw err;
  }
};

export const clearAppSettings = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    console.warn("clearAppSettings: Cannot clear app settings: No authenticated user.");
    logClientError("Cannot clear app settings: No authenticated user.", 'warn', { functionName: 'clearAppSettings' });
    return;
  }

  console.log("clearAppSettings: Attempting to clear settings for user_id:", user.id);

  try {
    const { error } = await supabase
      .from('app_config')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      console.error("clearAppSettings: Failed to clear app settings from Supabase:", error);
      logClientError("Failed to clear app settings from Supabase", 'error', { functionName: 'clearAppSettings', supabaseError: error });
      throw new Error(error.message);
    } else {
      console.log("clearAppSettings: Successfully cleared app settings from Supabase.");
    }
  } catch (err: any) {
    console.error("clearAppSettings: An unexpected error occurred while clearing app settings:", err);
    logClientError("An unexpected error occurred while clearing app settings", 'error', { functionName: 'clearAppSettings', stack: err.stack });
    throw err;
  }
};