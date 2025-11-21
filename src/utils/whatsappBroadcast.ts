"use client";

import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import type { Contact } from "@/types/group";
import { getAppSettings } from "@/utils/appSettingsStore"; // Import to get WAHA settings

export const sendWhatsAppBroadcast = async (message: string, contacts: Contact[]) => {
  const toastId = showLoading("Sending broadcast...");

  try {
    const appSettings = getAppSettings(); // Get WAHA settings
    const { wahaBaseUrl, wahaApiKey, wahaSessionName, wahaPhoneNumber } = appSettings;

    if (!wahaBaseUrl || !wahaApiKey || !wahaSessionName || !wahaPhoneNumber) {
      dismissToast(toastId.toString());
      showError("WAHA API settings are incomplete. Please configure them in Settings.");
      return { success: false, error: "WAHA API settings incomplete." };
    }

    const { data, error } = await supabase.functions.invoke('broadcast-whatsapp', {
      body: {
        message,
        contacts,
        wahaSettings: {
          baseUrl: wahaBaseUrl,
          apiKey: wahaApiKey,
          sessionName: wahaSessionName,
          phoneNumber: wahaPhoneNumber,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    dismissToast(toastId.toString());

    // Improved feedback based on successfulSends and failedSends
    if (data.successfulSends === 0 && data.failedSends > 0) {
      showError(`Broadcast failed for all contacts. Failed: ${data.failedSends}. Please check your WAHA API settings and contact numbers.`);
      return { success: false, error: `Broadcast failed for all contacts. Failed: ${data.failedSends}.` };
    } else if (data.successfulSends > 0 && data.failedSends > 0) {
      showSuccess(`Broadcast partially successful. Successful: ${data.successfulSends}, Failed: ${data.failedSends}. Some messages could not be sent.`);
    } else {
      showSuccess(`Broadcast sent! Successful: ${data.successfulSends}, Failed: ${data.failedSends}.`);
    }
    
    return { success: true, data };
  } catch (err: any) {
    dismissToast(toastId.toString());
    showError(err.message || "Failed to send broadcast.");
    return { success: false, error: err.message };
  }
};