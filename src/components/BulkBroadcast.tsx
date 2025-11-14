"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getGroups, sendGroupMessage } from "@/utils/groupStore";
import { isWahaConfigured, sendExternalBroadcast } from "@/utils/wahaClient";
import { getReplyNowLink } from "@/utils/replyLink";
import { showSuccess, showError, showLoading, dismissToast } from "@/utils/toast";
import type { Group } from "@/types/group";

type Props = {
  onCompleted?: () => void;
};

const BulkBroadcast: React.FC<Props> = ({ onCompleted }) => {
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [selected, setSelected] = React.useState<Record<string, boolean>>({});
  const [message, setMessage] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  // REMOVED: generatedLinks state (no more link generation)
  const [includeReplyLink, setIncludeReplyLink] = React.useState(true);

  // Helper to build message with a hardcoded reply link
  const buildMessageWithReply = async (original: string, includeLink: boolean = true): Promise<string> => {
    const trimmed = (original || "").trim();
    if (!includeLink) return trimmed;
    const link = getReplyNowLink();
    if (!link) return trimmed;
    return `${trimmed}\n\nReply now: ${link}`;
  };

  React.useEffect(() => {
    const g = getGroups();
    setGroups(g);
    const initial: Record<string, boolean> = {};
    g.forEach((grp) => (initial[grp.id] = false));
    setSelected(initial);
  }, []);

  const selectedGroups = groups.filter((g) => selected[g.id]);
  const totalRecipients = selectedGroups.reduce((sum, g) => sum + g.contacts.length, 0);
  const wahaReady = isWahaConfigured();

  const toggleGroup = (id: string, checked: boolean | string) => {
    setSelected((prev) => ({ ...prev, [id]: Boolean(checked) }));
  };

  const handleSend = async () => {
    const trimmed = (message || "").trim();
    if (!trimmed) {
      showError("Please enter a message to send.");
      return;
    }
    if (selectedGroups.length === 0) {
      showError("Please select at least one group.");
      return;
    }
    if (totalRecipients === 0) {
      showError("No recipients in selected groups.");
      return;
    }

    setIsSending(true);
    const loadingId = showLoading("Sending broadcast...");

    const finalMessageBase = await buildMessageWithReply(trimmed, includeReplyLink);

    if (wahaReady) {
      // Build personalized messages: "hi {name} {message}"
      const perContactMessages = selectedGroups.flatMap((group) =>
        group.contacts.map((c) => ({
          to: c.phone,
          text: `hi ${c.name ? `${c.name.trim()} ` : ""}${finalMessageBase}`,
        }))
      );

      const result = await sendExternalBroadcast(perContactMessages);
      dismissToast(String(loadingId));
      setIsSending(false);

      showSuccess(`Sent ${result.sent} messages via WAHA. ${result.failed > 0 ? `Failed: ${result.failed}` : ""}`);
      // REMOVED: clearing generatedLinks

      // Update local history and clear pending contacts
      for (const group of selectedGroups) {
        sendGroupMessage(group.id, finalMessageBase);
      }
    } else {
      dismissToast(String(loadingId));
      setIsSending(false);
      showError("WAHA is not configured. Please configure WAHA in Settings to send WhatsApp messages.");
    }

    setGroups(getGroups());
    if (onCompleted) onCompleted();
  };

  return (
    <Card className="p-4">
      <CardHeader className="p-0 mb-4">
        <CardTitle>Bulk Broadcast</CardTitle>
        <CardDescription>
          Send a message to contacts in selected groups.
          {wahaReady ? " WAHA is configured: messages will send automatically." : " WAHA not configured: please configure WAHA in Settings to send messages."}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="broadcast-message">Message</Label>
          <Textarea
            id="broadcast-message"
            placeholder="Type your broadcast message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px]"
            disabled={isSending}
          />
        </div>

        <div className="flex items-center gap-3">
          <Checkbox
            id="include-reply"
            checked={includeReplyLink}
            onCheckedChange={(checked) => setIncludeReplyLink(Boolean(checked))}
            disabled={isSending}
          />
          <Label htmlFor="include-reply" className="text-gray-800">
            Include "Reply now" link (click-to-chat)
          </Label>
          <span className="text-sm text-muted-foreground">
            Uses the configured reply number.
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Select Groups</Label>
            <div className="text-sm text-muted-foreground">
              Recipients: {totalRecipients}
            </div>
          </div>
          <div className="rounded-md border divide-y">
            {groups.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No groups available.</div>
            ) : (
              groups.map((g) => (
                <div key={g.id} className="flex items-center justify-between p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`grp-${g.id}`}
                      checked={selected[g.id] || false}
                      onCheckedChange={(checked) => toggleGroup(g.id, checked)}
                      disabled={isSending || g.contacts.length === 0}
                    />
                    <Label
                      htmlFor={`grp-${g.id}`}
                      className="text-gray-800"
                    >
                      {g.name}
                    </Label>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {g.contacts.length} pending
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-0 mt-4 flex justify-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            const noneSelected: Record<string, boolean> = {};
            groups.forEach((grp) => (noneSelected[grp.id] = false));
            setSelected(noneSelected);
            // REMOVED: clearing generatedLinks
          }}
          disabled={isSending}
        >
          Clear Selection
        </Button>
        <Button onClick={handleSend} disabled={isSending || totalRecipients === 0 || !message.trim()}>
          {isSending ? "Sending..." : "Send Broadcast"}
        </Button>
      </CardFooter>

      {/* REMOVED: Generated WhatsApp Links UI (no more link generation) */}
    </Card>
  );
};

export default BulkBroadcast;