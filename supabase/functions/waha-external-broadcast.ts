import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type BroadcastBody = {
  baseUrl: string;
  apiKey: string;
  sessionName: string;
  recipients: Array<{ to: string; text: string }>;
  concurrency?: number;
};

const normalizeBase = (baseUrl: string) => baseUrl.replace(/\/+$/, "");
const makeSessionBase = (baseUrl: string, sessionName: string) =>
  `${normalizeBase(baseUrl)}/sessions/${encodeURIComponent(sessionName)}`;
const makeMessagesEndpoint = (baseUrl: string, sessionName: string) =>
  `${makeSessionBase(baseUrl, sessionName)}/messages`;

const makeHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  "Authorization": `Bearer ${apiKey}`,
  "X-Api-Key": apiKey,
});

const normalizePhone = (phone: string) => (phone || "").replace(/\D+/g, "");
const ensureChatId = (to: string) => {
  const s = (to || "").trim();
  if (s.includes("@g.us") || s.includes("@c.us")) return s;
  return `${normalizePhone(s)}@c.us`;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: BroadcastBody | null = null;
  try {
    body = await req.json();
  } catch (_e) {
    body = null;
  }

  if (!body) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { baseUrl, apiKey, sessionName, recipients, concurrency = 5 } = body;
  if (!baseUrl || !apiKey || !sessionName || !Array.isArray(recipients)) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const url = `${normalizeBase(baseUrl)}/api/sendText`;

  const total = recipients.length;
  let sent = 0;
  let failed = 0;
  const results: Array<{ to: string; ok: boolean; status?: number; error?: string }> = [];

  let idx = 0;
  const worker = async () => {
    while (idx < recipients.length) {
      const currentIdx = idx++;
      const rec = recipients[currentIdx];

      const payload = {
        session: sessionName,
        chatId: ensureChatId(rec.to),
        text: rec.text,
      };

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: makeHeaders(apiKey),
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          sent++;
          results.push({ to: payload.to, ok: true, status: res.status });
        } else {
          failed++;
          const errorText = await res.text().catch(() => "");
          results.push({ to: payload.to, ok: false, status: res.status, error: errorText || "Failed to send" });
        }
      } catch (e) {
        failed++;
        results.push({ to: payload.to, ok: false, error: String(e) });
      }
    }
  };

  const workers = Array.from({ length: Math.max(1, Math.min(concurrency, 10)) }).map(() => worker());
  await Promise.all(workers);

  return new Response(JSON.stringify({ total, sent, failed, results }), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});