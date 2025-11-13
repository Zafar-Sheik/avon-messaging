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