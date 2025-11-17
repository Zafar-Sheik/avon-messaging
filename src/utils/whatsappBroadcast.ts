"use client";

import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import type { Contact } from "@/types/group";

export const sendWhatsAppBroadcast = async (message: string, contacts: Contact[]) => {
  const toastId = showLoading("Sending broadcast...");

  try {
    const { data, error } = await supabase.functions.invoke('broadcast-whatsapp', {
      body: { message, contacts },
    });

    if (error) {
      throw new Error(error.message);
    }

    dismissToast(toastId.toString());
    showSuccess(`Broadcast sent! Successful: ${data.successfulSends}, Failed: ${data.failedSends}.`);
    return { success: true, data };
  } catch (err: any) {
    dismissToast(toastId.toString());
    showError(err.message || "Failed to send broadcast.");
    return { success: false, error: err.message };
  }
};