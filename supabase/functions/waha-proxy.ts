import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type ProxyBody = {
  baseUrl: string;
  apiKey: string;
  sessionName: string;
  action: "messages" | "status" | "qrcode" | "start" | "stop" | "logout";
  payload?: unknown;
};

const normalizeBase = (baseUrl: string) => baseUrl.replace(/\/+$/, "");
const makeSessionBase = (baseUrl: string, sessionName: string) =>
  `${normalizeBase(baseUrl)}/sessions/${encodeURIComponent(sessionName)}`;
const makeMessagesEndpoint = (baseUrl: string, sessionName: string) =>
  `${makeSessionBase(baseUrl, sessionName)}/messages`;

const makeHeaders = (apiKey: string) => ({
  "Content-Type": "application/json",
  "Accept": "application/json",
  // WAHA implementations vary; we include both common auth header styles
  "Authorization": `Bearer ${apiKey}`,
  "X-Api-Key": apiKey,
});

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

  let body: ProxyBody | null = null;
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

  const { baseUrl, apiKey, sessionName, action, payload } = body;
  if (!baseUrl || !apiKey || !sessionName || !action) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (action === "messages") {
      const res = await fetch(makeMessagesEndpoint(baseUrl, sessionName), {
        method: "POST",
        headers: makeHeaders(apiKey),
        body: JSON.stringify(payload ?? {}),
      });
      const data = await res.json().catch(async () => ({ ok: res.ok, status: res.status, text: await res.text() }));
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "status") {
      const stateUrl = `${makeSessionBase(baseUrl, sessionName)}/state`;
      const clientUrl = `${makeSessionBase(baseUrl, sessionName)}/client`;
      const [stateRes, clientRes] = await Promise.all([
        fetch(stateUrl, { headers: makeHeaders(apiKey) }),
        fetch(clientUrl, { headers: makeHeaders(apiKey) }),
      ]);
      const state = await stateRes.json().catch(async () => ({ ok: stateRes.ok, status: stateRes.status, text: await stateRes.text() }));
      const client = await clientRes.json().catch(async () => ({ ok: clientRes.ok, status: clientRes.status, text: await clientRes.text() }));

      const status = (state?.status ?? state?.state ?? "unknown") as string;
      const phone =
        (client?.phone_number ?? client?.phone ?? client?.me?.id ?? undefined) as string | undefined;

      return new Response(JSON.stringify({ status, client, phone }), {
        status: stateRes.ok || clientRes.ok ? 200 : Math.max(stateRes.status, clientRes.status),
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "qrcode") {
      const qrUrl = `${makeSessionBase(baseUrl, sessionName)}/qrcode?image=true`;
      const res = await fetch(qrUrl, { headers: makeHeaders(apiKey) });
      const contentType = res.headers.get("content-type") ?? "";
      let data: unknown = null;

      if (contentType.includes("application/json")) {
        data = await res.json().catch(async () => ({ ok: res.ok, status: res.status, text: await res.text() }));
      } else {
        // WAHA often returns base64 as plain text
        data = await res.text();
      }

      return new Response(typeof data === "string" ? data : JSON.stringify(data), {
        status: res.ok ? 200 : res.status,
        headers: { ...corsHeaders, ...(typeof data === "string" ? { "Content-Type": "text/plain" } : { "Content-Type": "application/json" }) },
      });
    }

    if (action === "start" || action === "stop" || action === "logout") {
      const url = `${makeSessionBase(baseUrl, sessionName)}/${action}`;
      const res = await fetch(url, {
        method: "POST",
        headers: makeHeaders(apiKey),
      });
      const data = await res.json().catch(async () => ({ ok: res.ok, status: res.status, text: await res.text() }));
      return new Response(JSON.stringify(data), {
        status: res.ok ? 200 : res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: `Unsupported action: ${action}` }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("waha-proxy error:", e);
    return new Response(JSON.stringify({ error: "Internal error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});