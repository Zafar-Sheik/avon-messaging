"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getGroups, sendGroupMessage } from "@/utils/groupStore";
import { isWahaConfigured, getSessionStatus, sendExternalBroadcast } from "@/utils/wahaClient";
import { getCompanyProfile } from "@/utils/companyStore";
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
  const [generatedLinks, setGeneratedLinks] = React.useState<string[]>([]);

  // Helpers to build message with reply link
  const normalizeReplyPhone = (phone: string): string => (phone || "").replace(/\D+/g, "");
  const buildMessageWithReply = async (original: string): Promise<string> => {
    const trimmed = (original || "").trim();
    const company = getCompanyProfile();
    let replyPhone = company?.phone ? normalizeReplyPhone(company.phone) : "";

    if (!replyPhone && isWahaConfigured()) {
      const { phone } = await getSessionStatus();
      if (phone) replyPhone = normalizeReplyPhone(phone);
    }

    if (!replyPhone) return trimmed;
    return `${trimmed}\n\nReply now: https://wa.me/${replyPhone}`;
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

    const finalMessageBase = await buildMessageWithReply(trimmed);

    const allLinks: string[] = [];
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
      setGeneratedLinks([]);

      // Update local history and clear pending contacts
      for (const group of selectedGroups) {
        sendGroupMessage(group.id, finalMessageBase);
      }
    } else {
      // Generate links for manual sending
      for (const group of selectedGroups) {
        const { links } = sendGroupMessage(group.id, finalMessageBase);
        allLinks.push(...links);
      }

      dismissToast(String(loadingId));
      setIsSending(false);

      setGeneratedLinks(allLinks);
      showSuccess(`Prepared ${allLinks.length} WhatsApp links. Click a link to send.`);
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
          {wahaReady ? " WAHA is configured: messages will send automatically." : " WAHA not configured: links will be generated for manual sending."}
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
            setGeneratedLinks([]);
          }}
          disabled={isSending}
        >
          Clear Selection
        </Button>
        <Button onClick={handleSend} disabled={isSending || totalRecipients === 0 || !message.trim()}>
          {isSending ? "Sending..." : "Send Broadcast"}
        </Button>
      </CardFooter>

      {!wahaReady && generatedLinks.length > 0 && (
        <div className="mt-6">
          <CardTitle className="text-lg">Generated WhatsApp Links</CardTitle>
          <CardDescription className="mt-1">
            Click a link to open WhatsApp for that contact.
          </CardDescription>
          <div className="mt-3 max-h-48 overflow-auto rounded-md border">
            {generatedLinks.map((link, idx) => (
              <a
                key={`${link}-${idx}`}
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground truncate"
                title={link}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default BulkBroadcast;