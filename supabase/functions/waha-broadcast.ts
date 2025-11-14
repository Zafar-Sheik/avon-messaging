import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type BroadcastRequest = {
  baseUrl?: string;
  apiKey?: string;
  sessionName?: string;
  message?: string;
  recipients?: string[];
  concurrency?: number; // optional: concurrent sends per batch (default 5)
};

type SendResult = {
  to: string;
  ok: boolean;
  status: number;
  response?: unknown;
  error?: string;
};

const normalizePhone = (phone: string): string => (phone || "").replace(/\D+/g, "");
const sanitizeBaseUrl = (url: string): string => url.replace(/\/+$/, "");

async function sendTextMessage(
  sessionBase: string,
  apiKey: string,
  to: string,
  text: string
): Promise<SendResult> {
  const payload = { to: normalizePhone(to), type: "text", text };
  const headers: HeadersInit = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };

  try {
    const res = await fetch(`${sessionBase}/messages`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const responseBody = isJson ? await res.json() : await res.text();

    return {
      to,
      ok: res.ok,
      status: res.status,
      response: responseBody,
      error: res.ok ? undefined : (typeof responseBody === "string" ? responseBody : JSON.stringify(responseBody)),
    };
  } catch (e) {
    return {
      to,
      ok: false,
      status: 0,
      error: String(e),
    };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Manual auth handling (verify_jwt is false by default)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const body = (await req.json().catch(() => null)) as BroadcastRequest | null;
  if (
    !body ||
    !body.baseUrl ||
    !body.apiKey ||
    !body.sessionName ||
    !body.message ||
    !Array.isArray(body.recipients) ||
    body.recipients.length === 0
  ) {
    return new Response(
      JSON.stringify({
        error:
          "Missing required fields. Required: baseUrl, apiKey, sessionName, message, recipients[]",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  const baseUrl = sanitizeBaseUrl(body.baseUrl);
  const sessionBase = `${baseUrl}/sessions/${encodeURIComponent(body.sessionName)}`;
  const text = body.message;
  const recipients = body.recipients.filter(Boolean);
  const concurrency = Math.max(1, Math.min(body.concurrency ?? 5, 20));

  const results: SendResult[] = [];

  // Simple batching for controlled concurrency
  for (let i = 0; i < recipients.length; i += concurrency) {
    const batch = recipients.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map((to) => sendTextMessage(sessionBase, body.apiKey!, to, text))
    );
    results.push(...batchResults);
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.length - sent;

  const responsePayload = {
    total: results.length,
    sent,
    failed,
    results,
  };

  return new Response(JSON.stringify(responsePayload), {
    status: failed > 0 && sent === 0 ? 502 : 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});