"use client";

import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import type { Contact } from "@/types/group";
import { getAppSettings } from "@/utils/appSettingsStore";
import { logClientError } from "@/utils/log";

// Define a type for processed attachments
interface ProcessedAttachment {
  data: string; // Base64 encoded file data
  type: string; // MIME type
  name: string; // Original file name
}

// Helper function to convert File to Base64
const fileToBase64 = (file: File): Promise<ProcessedAttachment> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1]; // Extract base64 part
      if (base64String) {
        resolve({
          data: base64String,
          type: file.type,
          name: file.name,
        });
      } else {
        reject(new Error("Failed to convert file to base64."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

export const sendWhatsAppBroadcast = async (
  message: string,
  contacts: Contact[],
  attachments: File[] = [] // Accept File objects
) => {
  const toastId = showLoading("Sending broadcast...");

  try {
    // NEW: Client-side authentication check
    const { data: userRes } = await supabase.auth.getUser();
    if (!userRes.user) {
      dismissToast(toastId.toString());
      const errorMessage = "You must be signed in to send messages.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', details: 'User not authenticated' });
      return { success: false, error: errorMessage };
    }

    const appSettings = getAppSettings();
    const { wahaBaseUrl, wahaApiKey, wahaSessionName, wahaPhoneNumber } = appSettings;

    if (!wahaBaseUrl || !wahaApiKey || !wahaSessionName || !wahaPhoneNumber) {
      dismissToast(toastId.toString());
      const errorMessage = "WAHA API settings are incomplete. Please configure them in Settings.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', details: 'Missing WAHA settings' });
      return { success: false, error: errorMessage };
    }

    // Convert attachments to base64
    const processedAttachments: ProcessedAttachment[] = await Promise.all(
      attachments.map(fileToBase64)
    );

    console.log("Attempting to invoke broadcast-whatsapp Edge Function...");
    const { data, error } = await supabase.functions.invoke('broadcast-whatsapp', {
      body: {
        message,
        contacts,
        attachments: processedAttachments, // Pass processed attachments
        wahaSettings: {
          baseUrl: wahaBaseUrl,
          apiKey: wahaApiKey,
          sessionName: wahaSessionName,
          phoneNumber: wahaPhoneNumber,
        },
      },
    });

    if (error) {
      console.error("Error object from supabase.functions.invoke:", error);
      dismissToast(toastId.toString());
      let errorMessage = `Failed to invoke broadcast function: ${error.message || "Unknown error"}`;
      if (error.status === 401) {
        errorMessage = "Authentication failed for the broadcast function. Please ensure you are signed in.";
      } else if (error.status === 400) {
        errorMessage = `Invalid request to broadcast function: ${error.message || "Check message content or contacts."}`;
      }
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', supabaseError: error });
      return { success: false, error: error.message };
    }

    console.log("Data received from broadcast-whatsapp Edge Function:", data);

    if (!data || typeof data.successfulSends === 'undefined' || typeof data.failedSends === 'undefined') {
      dismissToast(toastId.toString());
      const errorMessage = "Invalid response from broadcast function. Please check Edge Function logs.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', responseData: data });
      return { success: false, error: "Invalid response structure." };
    }

    dismissToast(toastId.toString());

    if (data.successfulSends === 0 && data.failedSends > 0) {
      const errorMessage = `Broadcast failed for all contacts. Failed: ${data.failedSends}. Please check your WAHA API settings and contact numbers.`;
      showError(errorMessage);
      logClientError(errorMessage, 'warn', { functionName: 'sendWhatsAppBroadcast', details: data.details });
      return { success: false, error: errorMessage };
    } else if (data.successfulSends > 0 && data.failedSends > 0) {
      showSuccess(`Broadcast partially successful. Successful: ${data.successfulSends}, Failed: ${data.failedSends}. Some messages could not be sent.`);
      logClientError(`Broadcast partially successful. Failed: ${data.failedSends} messages.`, 'warn', { functionName: 'sendWhatsAppBroadcast', details: data.details });
    } else {
      showSuccess(`Broadcast sent! Successful: ${data.successfulSends}, Failed: ${data.failedSends}.`);
    }
    
    return { success: true, data };
  } catch (err: any) {
    dismissToast(toastId.toString());
    console.error("Caught unexpected error in sendWhatsAppBroadcast:", err);
    const errorMessage = err.message || "An unexpected error occurred while sending the broadcast.";
    showError(errorMessage);
    logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', stack: err.stack });
    return { success: false, error: err.message };
  }
};