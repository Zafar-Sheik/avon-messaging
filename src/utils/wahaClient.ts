"use client";

import { getWahaConfig } from "@/utils/wahaStore";
import { supabase } from "@/integrations/supabase/client";

const FUNCTION_NAME = "waha-proxy";

const invokeWaha = async (action: "messages" | "status" | "qrcode" | "start" | "stop" | "logout", payload?: unknown): Promise<any> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");

  const { data, error } = await supabase.functions.invoke(FUNCTION_NAME, {
    body: {
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      sessionName: cfg.sessionName,
      action,
      payload,
    },
    // Ensure Authorization header is always present (function only checks for presence)
    headers: {
      Authorization: "Bearer anonymous",
    },
  });

  if (error) {
    // Supabase returns structured error for function calls
    throw new Error(`WAHA proxy error: ${error.message}`);
  }
  return data;
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

  const { data, error } = await supabase.functions.invoke("waha-external-broadcast", {
    body: {
      baseUrl: cfg.baseUrl,
      apiKey: cfg.apiKey,
      sessionName: cfg.sessionName,
      recipients: messages,
      concurrency: 5,
    },
    // Ensure Authorization header is always present (function only checks for presence)
    headers: {
      Authorization: "Bearer anonymous",
    },
  });

  if (error) {
    throw new Error(`External broadcast error: ${error.message}`);
  }
  return data as { total: number; sent: number; failed: number; results: any[] };
};