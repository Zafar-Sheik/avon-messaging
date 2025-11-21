"use client";

import { supabase } from "@/integrations/supabase/client";

interface ErrorContext {
  component?: string;
  functionName?: string;
  stack?: string;
  [key: string]: any;
}

export const logClientError = async (
  message: string,
  level: 'error' | 'warn' | 'info' = 'error',
  context?: ErrorContext
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from('client_error_logs')
      .insert({
        user_id: user?.id || null, // Log user ID if available
        level,
        message,
        context: context || {},
      });

    if (error) {
      console.error("Failed to log client error to Supabase:", error.message);
    }
  } catch (err) {
    console.error("An unexpected error occurred while trying to log a client error:", err);
  }
};