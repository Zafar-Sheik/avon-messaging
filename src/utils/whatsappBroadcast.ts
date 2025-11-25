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

const EDGE_FUNCTION_TIMEOUT_MS = 30000; // 30 seconds timeout

export const sendWhatsAppBroadcast = async (
  message: string,
  contacts: Contact[],
  attachments: File[] = [] // Accept File objects
) => {
  const loadingToastId = showLoading("Sending broadcast...");
  const toastId = loadingToastId ? String(loadingToastId) : undefined; // Ensure toastId is a string

  try {
    const appSettings = await getAppSettings();
    const { wahaBaseUrl, wahaApiKey, wahaSessionName, wahaPhoneNumber } = appSettings;

    if (!wahaBaseUrl || !wahaApiKey || !wahaSessionName || !wahaPhoneNumber) {
      if (toastId) dismissToast(toastId);
      const errorMessage = "WAHA API settings are incomplete. Please configure them in Setup.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', details: 'Missing WAHA settings' });
      return { success: false, error: errorMessage };
    }

    const processedAttachments: ProcessedAttachment[] = await Promise.all(
      attachments.map(fileToBase64)
    );

    console.log("Attempting to invoke broadcast-whatsapp Edge Function...");

    const invokePromise = supabase.functions.invoke('broadcast-whatsapp', {
      body: {
        message,
        contacts,
        attachments: processedAttachments,
        wahaSettings: {
          baseUrl: wahaBaseUrl,
          apiKey: wahaApiKey,
          sessionName: wahaSessionName,
          phoneNumber: wahaPhoneNumber,
        },
      },
      // Removed headers as there's no authenticated user session
    });

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Edge Function timed out.")), EDGE_FUNCTION_TIMEOUT_MS)
    );

    const { data, error } = await Promise.race([invokePromise, timeoutPromise]) as { data: any, error: any };

    if (error) {
      console.error("Supabase function invocation error:", error);
      if (toastId) dismissToast(toastId);
      let errorMessage = `Failed to invoke broadcast function: ${error.message || "Unknown error"}`;
      if (error.status === 400) {
        errorMessage = `Invalid request to broadcast function: ${error.message || "Check message content or contacts."}`;
      }
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', supabaseError: error });
      return { success: false, error: error.message };
    }

    console.log("Data received from broadcast-whatsapp Edge Function:", data);

    if (!data || typeof data.successfulSends === 'undefined' || typeof data.failedSends === 'undefined') {
      if (toastId) dismissToast(toastId);
      const errorMessage = "Invalid response from broadcast function. Please check Edge Function logs.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', responseData: data });
      return { success: false, error: "Invalid response structure." };
    }

    if (toastId) dismissToast(toastId);

    // Refined logic for displaying toasts and returning success status
    if (data.successfulSends === 0 && data.failedSends > 0) {
      const errorMessage = `Broadcast failed for all contacts. Failed: ${data.failedSends}. Please check your WAHA API settings and contact numbers.`;
      showError(errorMessage);
      logClientError(errorMessage, 'warn', { functionName: 'sendWhatsAppBroadcast', details: data.details });
      return { success: false, error: errorMessage };
    } else if (data.successfulSends > 0 && data.failedSends > 0) {
      showSuccess(`Broadcast partially successful. Successful: ${data.successfulSends}, Failed: ${data.failedSends}. Some messages could not be sent.`);
      logClientError(`Broadcast partially successful. Failed: ${data.failedSends} messages.`, 'warn', { functionName: 'sendWhatsAppBroadcast', details: data.details });
      return { success: true, data }; // Return success: true if at least one message went through
    } else if (data.successfulSends > 0 && data.failedSends === 0) {
      showSuccess(`Broadcast sent! Successful: ${data.successfulSends}, Failed: ${data.failedSends}.`);
      return { success: true, data };
    } else { // This case should ideally not be reached if contacts were provided and validated
      const errorMessage = "Broadcast completed with no successful or failed sends. Check contacts and WAHA API status.";
      showError(errorMessage);
      logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', details: data.details });
      return { success: false, error: errorMessage };
    }
  } catch (err: any) {
    if (toastId) dismissToast(toastId);
    console.error("Caught unexpected error in sendWhatsAppBroadcast:", err);
    const errorMessage = err.message || "An unexpected error occurred while sending the broadcast.";
    showError(errorMessage);
    logClientError(errorMessage, 'error', { functionName: 'sendWhatsAppBroadcast', stack: err.stack });
    return { success: false, error: err.message };
  }
};