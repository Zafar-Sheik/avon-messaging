"use client";

// Removed supabase import as user is no longer authenticated
// import { supabase } from "@/integrations/supabase/client";

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
  // Since there's no authenticated user, we'll log to console only.
  // If Supabase logging is still desired, it would require a service role key
  // or public inserts, which is generally not recommended for user-specific data.
  console.error(`CLIENT ERROR [${level.toUpperCase()}]: ${message}`, context);
};