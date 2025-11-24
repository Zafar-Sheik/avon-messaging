"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup
import { showError, showSuccess } from "@/utils/toast";
import {
  recordGroupMessageSent,
  getOrCreateDirectMessagesGroup,
} from "@/utils/groupStore"; // Removed formatWhatsAppLink
import type { Contact } from "@/types/group";
import { Send, Paperclip, Trash2 } from "lucide-react"; // Removed ExternalLink
import { sendWhatsAppBroadcast } from "@/utils/whatsappBroadcast";

interface DirectMessageSenderProps {
  allContacts: Contact[];
  onMessageSent: (message: string, contacts: Contact[]) => void;
}

const DirectMessageSender: React.FC<DirectMessageSenderProps> = ({
  allContacts,
  onMessageSent,
}) => {
  const [inputMode, setInputMode] = React.useState<"select" | "manual">(
    "select"
  ); // New state for input mode
  const [selectedContactId, setSelectedContactId] = React.useState<string>("");
  const [manualPhoneNumber, setManualPhoneNumber] = React.useState<string>(""); // New state for manual input
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [isSending, setIsSending] = React.useState(false);

  const targetContact = React.useMemo(() => {
    if (inputMode === "manual") {
      const normalizedPhone = manualPhoneNumber.trim().replace(/\D+/g, "");
      if (normalizedPhone) {
        return {
          id: "manual-entry", // A dummy ID for manual entry
          name: "Manual Entry",
          phone: normalizedPhone,
        };
      }
      return undefined;
    } else {
      return allContacts.find((c) => c.id === selectedContactId);
    }
  }, [allContacts, selectedContactId, inputMode, manualPhoneNumber]);

  const handleSendDirectMessage = async () => {
    if (!targetContact) {
      showError("Please select or enter a contact to send the message to.");
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      showError("Please enter a message or attach at least one file.");
      return;
    }

    setIsSending(true);
    try { // ADDED TRY BLOCK
      const finalMessage = message.trim();
      const contactsToSend = [targetContact];

      const result = await sendWhatsAppBroadcast(
        finalMessage,
        contactsToSend,
        attachments
      );
      
      if (result.success) {
        const directMessagesGroup = getOrCreateDirectMessagesGroup();
        const { updated } = await recordGroupMessageSent(
          directMessagesGroup.id,
          finalMessage,
          contactsToSend
        );
        if (updated) {
          setMessage("");
          setAttachments([]);
          setManualPhoneNumber(""); // Clear manual input after sending
          onMessageSent(finalMessage, contactsToSend);
        }
      }
    } finally { // ADDED FINALLY BLOCK
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-4 m-0 h-full">
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700">
          Choose Contact Method
        </Label>
        <RadioGroup
          value={inputMode}
          onValueChange={(value: "select" | "manual") => setInputMode(value)}
          className="flex gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="select" id="select-contact" />
            <Label htmlFor="select-contact">Select Existing Contact</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="manual" id="manual-input" />
            <Label htmlFor="manual-input">Enter New Number</Label>
          </div>
        </RadioGroup>
      </div>

      {inputMode === "select" && (
        <div className="space-y-2">
          <Label
            htmlFor="select-contact-to-send"
            className="text-sm font-medium text-gray-700"
          >
            Select Contact
          </Label>
          <Select
            value={selectedContactId}
            onValueChange={setSelectedContactId}
            disabled={allContacts.length === 0}
          >
            <SelectTrigger id="select-contact-to-send" className="w-full md:w-96">
              <SelectValue placeholder="Choose a contact" />
            </SelectTrigger>
            <SelectContent>
              {allContacts.length === 0 ? (
                <SelectItem value="__none" disabled>
                  No contacts found
                </SelectItem>
              ) : (
                allContacts.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <div className="flex items-center gap-2">
                      {c.name || "Unnamed"}
                      <span className="text-xs text-muted-foreground">
                        ({c.phone})
                      </span>
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {inputMode === "manual" && (
        <div className="space-y-2">
          <Label
            htmlFor="manual-phone-number"
            className="text-sm font-medium text-gray-700"
          >
            Phone Number (with country code, digits only)
          </Label>
          <Input
            id="manual-phone-number"
            placeholder="e.g., 27821234567"
            value={manualPhoneNumber}
            onChange={(e) => setManualPhoneNumber(e.target.value)}
            className="w-full md:w-96"
          />
          <p className="text-xs text-muted-foreground">
            Enter the phone number in international format (e.g., 27821234567 for South Africa).
          </p>
        </div>
      )}

      <div>
        <Label className="text-sm font-medium text-gray-700 mb-2 block">
          Message Content
        </Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your WhatsApp message here..."
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
          onClick={handleSendDirectMessage}
          disabled={
            isSending ||
            (!message.trim() && attachments.length === 0) ||
            !targetContact
          }
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 flex-1 justify-center text-sm sm:text-base"
        >
          <Send className="size-4" />
          {isSending ? "Sending..." : "Send Direct Message"}
        </Button>

        {/* Removed Preview Link button */}
        {/* <Button
          variant="outline"
          disabled={
            !targetContact ||
            (!message.trim() && attachments.length === 0) ||
            isSending
          }
          onClick={() => {
            if (targetContact) {
              const url = formatWhatsAppLink(targetContact.phone, message);
              window.open(url, "_blank");
              showSuccess("Opening WhatsApp chat for preview.");
            }
          }}
          className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2 flex-1 justify-center text-sm sm:text-base"
        >
          <ExternalLink className="size-4" />
          Preview Link
        </Button> */}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs sm:text-sm text-blue-700">
          <strong>Note:</strong> Direct messages are sent one-by-one via the WAHA API.
        </p>
      </div>
    </div>
  );
};

export default DirectMessageSender;