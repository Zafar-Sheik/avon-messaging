"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { isWahaConfigured, sendTextMessage, getSessionStatus } from "@/utils/wahaClient";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import { Smartphone, Send, RefreshCcw } from "lucide-react";

const StatusBadge = ({ status }: { status: string }) => {
  const mapping: Record<string, { label: string; variant?: "default" | "secondary" | "destructive" | "outline" }> = {
    connected: { label: "Connected" },
    connecting: { label: "Connecting", variant: "secondary" },
    disconnected: { label: "Disconnected", variant: "outline" },
    qrcode: { label: "Awaiting QR", variant: "secondary" },
    unknown: { label: "Unknown", variant: "outline" },
  };
  const key = (status || "").toLowerCase();
  const conf = mapping[key] ?? mapping.unknown;
  return <Badge variant={conf.variant ?? "default"}>{conf.label}</Badge>;
};

const WahaTestSender: React.FC = () => {
  const [status, setStatus] = React.useState<string>("unknown");
  const [linkedPhone, setLinkedPhone] = React.useState<string | undefined>(undefined);
  const [to, setTo] = React.useState("");
  const [text, setText] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);

  const configured = isWahaConfigured();

  const refreshStatus = React.useCallback(async () => {
    if (!configured) {
      setStatus("unknown");
      setLinkedPhone(undefined);
      return;
    }
    const s = await getSessionStatus();
    setStatus(s.status);
    setLinkedPhone(s.phone);
  }, [configured]);

  React.useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const handleSend = async () => {
    if (!configured) {
      showError("WAHA is not configured. Go to Settings and save Base URL, API Key, and Session Name.");
      return;
    }
    const trimmedTo = to.trim();
    const trimmedText = text.trim();
    if (!trimmedTo) {
      showError("Please enter a recipient phone number.");
      return;
    }
    if (!trimmedText) {
      showError("Please enter a message to send.");
      return;
    }

    setIsSending(true);
    const loadingId = showLoading("Sending WhatsApp message...");

    try {
      await sendTextMessage(trimmedTo, trimmedText);
      dismissToast(String(loadingId));
      showSuccess("Message sent via WAHA.");
      setText("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>WAHA Test Sender</CardTitle>
        <CardDescription>Send a quick test message to a single number to verify your WAHA setup.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Smartphone className="size-4 text-muted-foreground" />
          <span className="text-sm">Session Status:</span>
          <StatusBadge status={status} />
          {linkedPhone ? (
            <>
              <span className="text-sm">Linked:</span>
              <Badge>{linkedPhone}</Badge>
            </>
          ) : null}
          <Button variant="secondary" size="sm" onClick={refreshStatus}>
            <RefreshCcw className="size-4" />
            <span>Check Status</span>
          </Button>
        </div>

        {!configured && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            WAHA is not configured. Open Settings → WAHA Settings, fill in Base URL, API Key, and Session Name, then Save.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="waha-test-to">Recipient Phone</Label>
            <Input
              id="waha-test-to"
              placeholder="+1234567890"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              disabled={isSending}
            />
            <p className="text-xs text-muted-foreground">
              Use an international number. Non-digit characters are removed automatically.
            </p>
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="waha-test-text">Message</Label>
            <Textarea
              id="waha-test-text"
              placeholder="Type your test message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[90px]"
              disabled={isSending}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="secondary" onClick={() => { setTo(""); setText(""); }} disabled={isSending}>
          Clear
        </Button>
        <Button onClick={handleSend} disabled={isSending || !to.trim() || !text.trim()}>
          <Send className="size-4" />
          <span>{isSending ? "Sending..." : "Send Test"}</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WahaTestSender;