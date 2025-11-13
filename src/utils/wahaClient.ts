"use client";

import { getWahaConfig } from "@/utils/wahaStore";

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
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = makeEndpoint(cfg.baseUrl, cfg.sessionName);
  const payload: WahaSendTextPayload = { to: normalizePhone(to), type: "text", text };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA request failed (${res.status}): ${body}`);
  }
};

export const sendFileMessage = async (
  to: string,
  filename: string,
  mimeType: string,
  base64: string,
  caption?: string
): Promise<void> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = makeEndpoint(cfg.baseUrl, cfg.sessionName);
  const payload: WahaSendFilePayload = {
    to: normalizePhone(to),
    type: "file",
    filename,
    mimeType,
    base64,
    caption,
  };
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${cfg.apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA request failed (${res.status}): ${body}`);
  }
};

export const getSessionStatus = async (): Promise<{ status: string; phone?: string }> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = makeSessionBase(cfg.baseUrl, cfg.sessionName);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA status failed (${res.status}): ${body}`);
  }
  const data = await res.json();
  const status = (data.status ?? data.state ?? "unknown") as string;
  const phone =
    (data.client?.phone_number ??
      data.client?.phone ??
      data.phone_number ??
      data.phone ??
      data.me?.id ??
      undefined) as string | undefined;
  return { status, phone };
};

export const getSessionQrCode = async (): Promise<string> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = `${makeSessionBase(cfg.baseUrl, cfg.sessionName)}/qrcode`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA QR fetch failed (${res.status}): ${body}`);
  }
  // Many WAHA servers return base64 image as plain text
  const base64 = await res.text();
  return base64;
};

export const startSession = async (): Promise<void> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = `${makeSessionBase(cfg.baseUrl, cfg.sessionName)}/start`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA start failed (${res.status}): ${body}`);
  }
};

export const stopSession = async (): Promise<void> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = `${makeSessionBase(cfg.baseUrl, cfg.sessionName)}/stop`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA stop failed (${res.status}): ${body}`);
  }
};

export const logoutSession = async (): Promise<void> => {
  const cfg = getWahaConfig();
  if (!cfg) throw new Error("WAHA is not configured. Set it in Settings.");
  const url = `${makeSessionBase(cfg.baseUrl, cfg.sessionName)}/logout`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`WAHA logout failed (${res.status}): ${body}`);
  }
};