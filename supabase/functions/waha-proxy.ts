import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

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

  const body = await req.json().catch(() => null) as {
    baseUrl?: string;
    apiKey?: string;
    sessionName?: string;
    action?: "messages" | "status" | "qrcode" | "start" | "stop" | "logout";
    payload?: unknown;
  } | null;

  if (!body || !body.baseUrl || !body.apiKey || !body.sessionName || !body.action) {
    return new Response(JSON.stringify({ error: "Missing required fields: baseUrl, apiKey, sessionName, action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const baseUrl = body.baseUrl.replace(/\/+$/, "");
  const sessionBase = `${baseUrl}/sessions/${encodeURIComponent(body.sessionName)}`;
  let url = sessionBase;
  let method: "GET" | "POST" = "GET";
  let forwardBody: BodyInit | undefined;
  let contentType: string | undefined;

  switch (body.action) {
    case "messages":
      url = `${sessionBase}/messages`;
      method = "POST";
      forwardBody = JSON.stringify(body.payload ?? {});
      contentType = "application/json";
      break;
    case "status":
      url = sessionBase;
      method = "GET";
      break;
    case "qrcode":
      url = `${sessionBase}/qrcode`;
      method = "GET";
      break;
    case "start":
    case "stop":
    case "logout":
      url = `${sessionBase}/${body.action}`;
      method = "POST";
      break;
    default:
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
  }

  const headers: HeadersInit = {
    Authorization: `Bearer ${body.apiKey}`,
  };
  if (contentType) headers["Content-Type"] = contentType;

  try {
    const res = await fetch(url, { method, headers, body: forwardBody });

    // Some endpoints return text (e.g. qrcode), others return JSON
    const contentTypeRes = res.headers.get("content-type") || "";
    const isJson = contentTypeRes.includes("application/json");

    const responseBody = isJson ? await res.json() : await res.text();

    return new Response(isJson ? JSON.stringify(responseBody) : responseBody, {
      status: res.status,
      headers: {
        ...corsHeaders,
        "Content-Type": isJson ? "application/json" : "text/plain",
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "Proxy fetch failed", details: String(e) }), {
      status: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});