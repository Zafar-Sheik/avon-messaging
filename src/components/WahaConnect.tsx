"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isWahaConfigured, startSession, getSessionQrCode, getSessionStatus, stopSession, logoutSession } from "@/utils/wahaClient";
import { getWahaConfig } from "@/utils/wahaStore";
import { showSuccess, showError } from "@/utils/toast";
import { Smartphone, QrCode, Link2, RefreshCcw, Power } from "lucide-react";

const StatusBadge = ({ status }: { status: string }) => {
  const mapping: Record<string, { label: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    connected: { label: "Connected" },
    connecting: { label: "Connecting", variant: "secondary" },
    disconnected: { label: "Disconnected", variant: "outline" },
    qrcode: { label: "Awaiting QR Scan", variant: "secondary" },
    unknown: { label: "Unknown", variant: "outline" },
  };
  const key = (status || "").toLowerCase();
  const conf = mapping[key] ?? mapping.unknown;
  return <Badge variant={conf.variant ?? "default"}>{conf.label}</Badge>;
};

const WahaConnect: React.FC = () => {
  const [status, setStatus] = React.useState<string>("unknown");
  const [phone, setPhone] = React.useState<string | undefined>(undefined);
  const [qrBase64, setQrBase64] = React.useState<string>("");
  const [polling, setPolling] = React.useState<boolean>(false);
  // Trigger re-render when settings change
  const [configVersion, setConfigVersion] = React.useState<number>(0);

  const cfg = getWahaConfig();
  const configured = isWahaConfigured();

  const refreshStatus = React.useCallback(async () => {
    const s = await getSessionStatus();
    setStatus(s.status);
    setPhone(s.phone);
    if ((s.status || "").toLowerCase() === "connected") {
      setQrBase64("");
      setPolling(false);
      showSuccess("WAHA session is connected.");
    }
  }, []);

  // If WAHA becomes configured, refresh status
  React.useEffect(() => {
    if (isWahaConfigured()) {
      refreshStatus();
    }
  }, [refreshStatus, configVersion]);

  // Listen to settings changes and re-check config
  React.useEffect(() => {
    const onChanged = () => setConfigVersion((v) => v + 1);
    window.addEventListener("waha-config-changed", onChanged);
    return () => window.removeEventListener("waha-config-changed", onChanged);
  }, []);

  React.useEffect(() => {
    if (!polling) return;
    const id = setInterval(() => {
      refreshStatus();
    }, 4000);
    return () => clearInterval(id);
  }, [polling, refreshStatus]);

  const handleStartAndShowQr = async () => {
    if (!isWahaConfigured()) {
      showError("Please configure WAHA in Settings first.");
      return;
    }
    await startSession();
    const base64 = await getSessionQrCode();
    setQrBase64(base64);
    setPolling(true);
    showSuccess("Session started. Scan the QR with WhatsApp on your phone.");
  };

  const handleRefreshQr = async () => {
    const base64 = await getSessionQrCode();
    setQrBase64(base64);
    showSuccess("QR code refreshed.");
  };

  const handleRefreshStatus = async () => {
    await refreshStatus();
    showSuccess("Status refreshed.");
  };

  const handleStop = async () => {
    await stopSession();
    setPolling(false);
    setQrBase64("");
    await refreshStatus();
    showSuccess("Session stopped.");
  };

  const handleLogout = async () => {
    await logoutSession();
    setPolling(false);
    setQrBase64("");
    await refreshStatus();
    showSuccess("Session logged out.");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WAHA Connect</CardTitle>
        <CardDescription>Start a session, scan the QR code, and link your phone number.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!configured && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            WAHA is not configured. Fill Base URL, API Key, and Session Name in WAHA Settings above, then click Save to enable the buttons.
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <Smartphone className="size-4 text-muted-foreground" />
          <span className="text-sm">Session:</span>
          <Badge variant="outline">{cfg?.sessionName ?? "—"}</Badge>
          <span className="text-sm">Status:</span>
          <StatusBadge status={status} />
          {phone ? (
            <>
              <Link2 className="size-4 text-muted-foreground" />
              <span className="text-sm">Linked:</span>
              <Badge>{phone}</Badge>
            </>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleStartAndShowQr} title="Start session and display QR" disabled={!configured}>
            <QrCode className="size-4" />
            <span>Start & Show QR</span>
          </Button>
          <Button variant="secondary" onClick={handleRefreshQr} disabled={!qrBase64 || !configured}>
            <RefreshCcw className="size-4" />
            <span>Refresh QR</span>
          </Button>
          <Button variant="secondary" onClick={handleRefreshStatus} disabled={!configured}>
            <RefreshCcw className="size-4" />
            <span>Refresh Status</span>
          </Button>
          <Button variant="outline" onClick={handleStop} disabled={!configured}>
            <Power className="size-4" />
            <span>Stop</span>
          </Button>
          <Button variant="destructive" onClick={handleLogout} disabled={!configured}>
            <Power className="size-4" />
            <span>Logout</span>
          </Button>
        </div>

        {qrBase64 && (
          <div className="rounded-md border p-4">
            <div className="flex items-center gap-2 mb-3">
              <QrCode className="size-4 text-muted-foreground" />
              <span className="text-sm font-medium">Scan this QR with WhatsApp on your phone</span>
            </div>
            <div className="flex items-center justify-center">
              <img
                src={`data:image/png;base64,${qrBase64}`}
                alt="WAHA QR code"
                className="w-64 h-64 object-contain rounded-md border bg-white"
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Open WhatsApp on your phone → Menu → Linked devices → Link a device → Scan the QR shown here.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        If the QR expires, click Refresh QR. Once connected, you'll see your linked phone number above.
      </CardFooter>
    </Card>
  );
};

export default WahaConnect;