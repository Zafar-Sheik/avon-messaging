"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";
import {
  getGroupById,
  recordGroupMessageSent,
} from "@/utils/groupStore";
import type { Contact, Group } from "@/types/group";
import { Send, Paperclip, Trash2 } from "lucide-react"; // Removed ExternalLink
import { sendWhatsAppBroadcast } from "@/utils/whatsappBroadcast";

interface MessageSenderProps {
  groupId: string;
  onMessageSent: (message: string, contacts: Contact[]) => void;
}

// Removed buildMessageWithReply as it's no longer needed.
// const buildMessageWithReply = (original: string): string => {
//   return (original || "").trim();
// };

const MessageSender: React.FC<MessageSenderProps> = ({
  groupId,
  onMessageSent,
}) => {
  const [group, setGroup] = React.useState<Group | undefined>(
    getGroupById(groupId)
  );
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isSendingBroadcast, setIsSendingBroadcast] = React.useState(false);

  React.useEffect(() => {
    setGroup(getGroupById(groupId));
  }, [groupId]);

  const handleSendBroadcast = async () => {
    if (!group) return;
    if (!message.trim() && attachments.length === 0) { // Message OR attachments are required
      showError("Please enter a message or attach at least one file.");
      return;
    }
    if (group.contacts.length === 0) {
      showError("No contacts in this group to send a broadcast to.");
      return;
    }

    setIsSendingBroadcast(true);
    try { // ADDED TRY BLOCK
      const finalMessage = message.trim(); // Use message directly
      const result = await sendWhatsAppBroadcast(finalMessage, group.contacts, attachments); // Pass attachments

      // NEW: Log the result of the broadcast for debugging
      console.log("WhatsApp Broadcast Result:", result);

      if (result.success) {
        // Record the message in local history after successful (simulated) broadcast
        const { updated } = await recordGroupMessageSent( // Await the async function
          group.id,
          finalMessage,
          group.contacts
        );
        if (updated) {
          setGroup(updated); // Update local group state
          setMessage("");
          setAttachments([]); // Clear attachments as well
          onMessageSent(finalMessage, group.contacts); // Notify parent
        }
      }
    } finally { // ADDED FINALLY BLOCK
      setIsSendingBroadcast(false);
    }
  };

  if (!group) {
    return (
      <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-600 text-xs sm:text-sm">
          Group not found or not selected.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 m-0 h-full">
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium text-gray-700 mb-2 block">
            Message Content
          </Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your WhatsApp message here... This message will be sent to all contacts in this group."
            className="min-h-32 resize-none border-gray-300 focus:border-blue-500 text-sm"
          />
        </div>

        <div className="rounded-lg border border-gray-200 p-3 sm:p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="size-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Attachments (Optional)
              </span>
            </div>
            {attachments.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setAttachments([])}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 text-xs"
              >
                <Trash2 className="size-3 sm:size-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>

          <Input
            type="file"
            multiple
            accept="image/*,application/*,video/*"
            onChange={(e) =>
              setAttachments(e.target.files ? Array.from(e.target.files) : [])
            }
            className="border-gray-300 text-sm"
          />

          {attachments.length > 0 && (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="max-h-48 overflow-auto divide-y divide-gray-200">
                {attachments.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 sm:p-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <Paperclip className="size-3 sm:size-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-xs sm:text-sm font-medium text-gray-900">
                          {f.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {f.type || "Unknown"} •{" "}
                          {(f.size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        setAttachments((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0 h-7 w-7 sm:h-9 sm:w-9"
                    >
                      <Trash2 className="size-3 sm:size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleSendBroadcast}
            disabled={
              isSendingBroadcast ||
              (!message.trim() && attachments.length === 0) || // Disable if no message and no attachments
              group.contacts.length === 0
            }
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1 justify-center text-sm sm:text-base"
          >
            <Send className="size-4" />
            {isSendingBroadcast
              ? "Sending..."
              : `Send to ${group.contacts.length} Contact${
                  group.contacts.length !== 1 ? "s" : ""
                }`}
          </Button>

          {/* Removed Preview Links button */}
          {/* <Button
            variant="outline"
            disabled={
              group.contacts.length === 0 ||
              (!message.trim() && attachments.length === 0) ||
              isSendingBroadcast
            }
            onClick={() => {
              const preview = group.contacts.map((c) =>
                formatWhatsAppLink(c.phone, message)
              );
              const sample = preview.slice(0, 3);
              showSuccess(
                `Previewing ${preview.length} links. Opening 3 samples.`
              );
              for (const url of sample) window.open(url, "_blank");
            }}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 flex-1 justify-center text-sm sm:text-base"
          >
            <ExternalLink className="size-4" />
            Preview Links
          </Button> */}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-blue-700">
            <strong>Note:</strong> Messages are sent via the WAHA API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MessageSender;