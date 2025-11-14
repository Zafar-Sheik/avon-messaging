"use client";

import { getWahaConfig } from "@/utils/wahaStore";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_NAME = "waha-proxy";

// Add a robust invocation helper with fallback to direct fetch
const SUPABASE_FUNCTIONS_BASE = "https://diuezeewlgegnwgcdpmr.supabase.co/functions/v1";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpdWV6ZWV3bGdlZ253Z2NkcG1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NzgyNzEsImV4cCI6MjA3ODQ1NDI3MX0.0JbeX6VILTrYWorwShVkQqajZbAMeUYv0jtlnqpF5Vs";

async function callSupabaseFunction<T = any>(name: string, body: any): Promise<T> {
  try {
    const { data, error } = await supabase.functions.invoke(name, {
      body,
      // DO NOT override headers; let Supabase send the correct Authorization
    });

    if (!error) return data as T;

    const msg = String(error.message || "").toLowerCase();
    const isNetworkError =
      msg.indexOf("failed to send a request") !== -1 ||
      msg.indexOf("failed to fetch") !== -1 ||
      msg.indexOf("network") !== -1 ||
      msg.indexOf("cors") !== -1;

    if (!isNetworkError) {
      throw new Error(error.message);
    }
    // If it is a network/CORS error, fall through to direct fetch.
  } catch (err: any) {
    const msg = String(err?.message || "").toLowerCase();
    const isNetworkError =
      msg.indexOf("failed to send a request") !== -1 ||
      msg.indexOf("failed to fetch") !== -1 ||
      msg.indexOf("network") !== -1 ||
      msg.indexOf("cors") !== -1;

    if (!isNetworkError) {
      throw err;
    }
    // If it is a network/CORS error, continue to direct fetch below.
  }

  // Fallback: direct fetch for network/CORS errors
  const resp = await fetch(`${SUPABASE_FUNCTIONS_BASE}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || `Edge function ${name} failed with status ${resp.status}`);
  }

  const ct = resp.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    return (await resp.json()) as T;
  }
  return (await resp.text()) as T;
}

const invokeWaha = async (action: "messages" | "status" | "qrcode" | "start" | "stop" | "logout", payload?: unknown): Promise<any> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");

  return await callSupabaseFunction(FUNCTION_NAME, {
    baseUrl: cfg.baseUrl,
    apiKey: cfg.apiKey,
    sessionName: cfg.sessionName,
    action,
    payload,
  });
};

export type WahaSendTextPayload = {
  to: string;
  type: "text";
  text: string;
};

export type WahaSendFilePayload = {
  to: string;
  type: "file";
  filename: string;
  mimeType: string;
  base64: string;
  caption?: string;
};

const normalizePhone = (phone: string): string => (phone || "").replace(/\D+/g, "");

const makeEndpoint = (baseUrl: string, sessionName: string) =>
  `${baseUrl.replace(/\/+$/, "")}/sessions/${encodeURIComponent(sessionName)}/messages`;

const makeSessionBase = (baseUrl: string, sessionName: string) =>
  `${baseUrl.replace(/\/+$/, "")}/sessions/${encodeURIComponent(sessionName)}`;

export const isWahaConfigured = (): boolean => !!getWahaConfig();

export const sendTextMessage = async (to: string, text: string): Promise<void> => {
  const payload: WahaSendTextPayload = { to: normalizePhone(to), type: "text", text };
  await invokeWaha("messages", payload);
};

export const sendFileMessage = async (
  to: string,
  filename: string,
  mimeType: string,
  base64: string,
  caption?: string
): Promise<void> => {
  const payload: WahaSendFilePayload = {
    to: normalizePhone(to),
    type: "file",
    filename,
    mimeType,
    base64,
    caption,
  };
  await invokeWaha("messages", payload);
};

export const sendTextToChat = async (toChatId: string, text: string): Promise<void> => {
  const payload: WahaSendTextPayload = { to: toChatId, type: "text", text };
  await invokeWaha("messages", payload);
};

export const sendFileToChat = async (
  toChatId: string,
  filename: string,
  mimeType: string,
  base64: string,
  caption?: string
): Promise<void> => {
  const payload: WahaSendFilePayload = {
    to: toChatId,
    type: "file",
    filename,
    mimeType,
    base64,
    caption,
  };
  await invokeWaha("messages", payload);
};

export const getSessionStatus = async (): Promise<{ status: string; phone?: string }> => {
  const data = await invokeWaha("status");
  const status = (data?.status ?? data?.state ?? "unknown") as string;
  const phone =
    (data?.client?.phone_number ??
      data?.client?.phone ??
      data?.phone_number ??
      data?.phone ??
      data?.me?.id ??
      undefined) as string | undefined;
  return { status, phone };
};

export const getSessionQrCode = async (): Promise<string> => {
  const base64 = await invokeWaha("qrcode");
  return typeof base64 === "string" ? base64 : String(base64 ?? "");
};

export const startSession = async (): Promise<void> => {
  await invokeWaha("start");
};

export const stopSession = async (): Promise<void> => {
  await invokeWaha("stop");
};

export const logoutSession = async (): Promise<void> => {
  await invokeWaha("logout");
};

export const sendExternalBroadcast = async (
  messages: Array<{ to: string; text: string }>
): Promise<{ total: number; sent: number; failed: number; results: any[] }> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");

  const data = await callSupabaseFunction<{ total: number; sent: number; failed: number; results: any[] }>(
    "waha-external-broadcast",
    {
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      sessionName: cfg.sessionName,
      recipients: messages,
      concurrency: 5,
    }
  );

  return data;
};