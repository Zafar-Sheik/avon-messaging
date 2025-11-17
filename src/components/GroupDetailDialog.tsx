"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { showError, showSuccess } from "@/utils/toast";
import ContactImport from "@/components/ContactImport";
import {
  getGroupById,
  addContactsToGroup,
  sendGroupMessage,
  formatWhatsAppLink,
} from "@/utils/groupStore";
import type { Group } from "@/types/group";
import {
  ExternalLink,
  Send,
  Paperclip,
  Trash2,
  Users,
  MessageSquare,
  History,
  Download,
  Phone,
  Calendar,
  Pencil,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  isWahaConfigured,
  sendTextMessage,
  sendFileMessage,
} from "@/utils/wahaClient";
import EditGroupDialog from "@/components/EditGroupDialog";
import DeleteGroupAlert from "@/components/DeleteGroupAlert";

type Props = {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

const GroupDetailDialog: React.FC<Props> = ({
  groupId,
  open,
  onOpenChange,
  onRefresh,
}) => {
  const [group, setGroup] = React.useState<Group | undefined>(
    getGroupById(groupId)
  );
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const tabsRef = React.useRef<HTMLButtonElement>(null);

  const [isEditGroupOpen, setIsEditGroupOpen] = React.useState(false);
  const [isDeleteGroupAlertOpen, setIsDeleteGroupAlertOpen] = React.useState(false);

  React.useEffect(() => {
    setGroup(getGroupById(groupId));
  }, [groupId, open]);

  const readFileAsBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSendViaWaha = async () => {
    if (!group) return;
    if (!isWahaConfigured()) {
      showError(
        "Please configure WAHA in Settings to send messages and media."
      );
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      showError("Add a message or attach files to send.");
      return;
    }

    for (const c of group.contacts) {
      if (attachments.length > 0) {
        for (const file of attachments) {
          const base64 = await readFileAsBase64(file);
          await sendFileMessage(
            c.phone,
            file.name,
            file.type || "application/octet-stream",
            base64,
            message.trim() || undefined
          );
        }
      } else {
        await sendTextMessage(c.phone, message);
      }
    }

    const { updated } = sendGroupMessage(groupId, message);
    if (updated) {
      setGroup(updated);
      setMessage("");
      setAttachments([]);
      onRefresh();
    }
    showSuccess(
      `Sent WAHA message${attachments.length ? " with attachments" : ""} to ${
        group.contacts.length
      } contact(s).`
    );
  };

  const handleImport = (contacts: Array<{ name: string; phone: string }>) => {
    const updated = addContactsToGroup(groupId, contacts);
    if (updated) {
      setGroup(updated);
      onRefresh();
      showSuccess(
        `Imported ${contacts.length} contact(s) into "${updated.name}".`
      );
    } else {
      showError("Failed to import contacts.");
    }
  };

  const openWhatsAppWindows = (links: string[]) => {
    let opened = 0;
    for (const url of links) {
      const win = window.open(url, "_blank");
      if (win) opened++;
    }
    return opened;
  };

  const handleSend = () => {
    if (!group) return;
    if (!message.trim()) {
      showError("Please enter a message.");
      return;
    }
    const { links, updated } = sendGroupMessage(groupId, message);
    const opened = openWhatsAppWindows(links);
    showSuccess(
      `Prepared ${links.length} WhatsApp chats. Opened ${opened} tab(s).`
    );
    if (updated) {
      setGroup(updated);
      setMessage("");
      onRefresh();
    }
  };

  const handleImportContactsClick = () => {
    if (tabsRef.current) {
      tabsRef.current.click();
    }
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="size-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-semibold text-gray-900 truncate">
                {group.name}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1 text-sm">
                  <Users className="size-4" />
                  {group.contacts.length} contacts
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <MessageSquare className="size-4" />
                  {group.sentHistory.length} messages sent
                </span>
                <span className="flex items-center gap-1 text-sm">
                  <Calendar className="size-4" />
                  Created{" "}
                  {new Date(group.createdAt || group.id).toLocaleDateString()}
                </span>
              </DialogDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditGroupOpen(true)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => setIsDeleteGroupAlertOpen(true)}>
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          defaultValue="contacts"
          className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="contacts"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Users className="size-4" />
              Contacts
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">
                {group.contacts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm"
              ref={tabsRef}>
              <Download className="size-4" />
              Import
            </TabsTrigger>
            <TabsTrigger
              value="send"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <Send className="size-4" />
              Send Message
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <History className="size-4" />
              History
              <Badge variant="secondary" className="ml-1 h-5 min-w-5">
                {group.sentHistory.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto pt-4">
            <TabsContent value="contacts" className="space-y-4 m-0 h-full">
              {group.contacts.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="size-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">
                    No contacts yet
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Import contacts from Excel to get started
                  </p>
                  <Button
                    onClick={handleImportContactsClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    Import Contacts
                  </Button>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Phone Number
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700 w-20">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.contacts.map((c) => (
                        <TableRow
                          key={c.id}
                          className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-900">
                            {c.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-gray-600">
                            {c.phone}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                window.open(
                                  formatWhatsAppLink(c.phone, ""),
                                  "_blank"
                                )
                              }
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                              <Phone className="size-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="import" className="m-0 h-full">
              <ContactImport onImported={handleImport} />
            </TabsContent>

            <TabsContent value="send" className="space-y-4 m-0 h-full">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Message Content
                  </label>
                  <Textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your WhatsApp message here... This message will be sent to all contacts in this group."
                    className="min-h-32 resize-none border-gray-300 focus:border-blue-500"
                  />
                </div>

                <div className="rounded-lg border border-gray-200 p-4 space-y-3">
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
                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="size-4 mr-1" />
                        Clear All
                      </Button>
                    )}
                  </div>

                  <Input
                    type="file"
                    multiple
                    accept="image/*,application/*,video/*"
                    onChange={(e) =>
                      setAttachments(
                        e.target.files ? Array.from(e.target.files) : []
                      )
                    }
                    className="border-gray-300"
                  />

                  {attachments.length > 0 && (
                    <div className="rounded-lg border border-gray-200 overflow-hidden">
                      <div className="max-h-48 overflow-auto divide-y divide-gray-200">
                        {attachments.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <Paperclip className="size-4 text-gray-400 flex-shrink-0" />
                              <div className="min-w-0 flex-1">
                                <div className="truncate text-sm font-medium text-gray-900">
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
                              className="text-gray-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0">
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-gray-200 p-4 space-y-2">
                  <div className="text-sm font-medium">
                    WhatsApp Group Chat IDs (via WAHA)
                  </div>
                  <Input
                    value={chatIds}
                    onChange={(e) => setChatIds(e.target.value)}
                    placeholder="e.g., 12345-67890@g.us, 22222-33333@g.us"
                  />
                  <p className="text-xs text-muted-foreground">
                    Paste WhatsApp group chat IDs ending with{" "}
                    <span className="font-mono">@g.us</span>, separated by commas or
                    spaces.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={handleSend}
                    disabled={!message.trim() || group.contacts.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                    <Send className="size-4" />
                    Send to {group.contacts.length} Contacts
                  </Button>

                  <Button
                    variant="outline"
                    disabled={group.contacts.length === 0 || !message.trim()}
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
                    className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                    <ExternalLink className="size-4" />
                    Preview Links
                  </Button>

                  <Button
                    variant="default"
                    disabled={
                      !isWahaConfigured() ||
                      group.contacts.length === 0 ||
                      (!message.trim() && attachments.length === 0)
                    }
                    onClick={handleSendViaWaha}
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    title={
                      isWahaConfigured()
                        ? "Send via WAHA"
                        : "Configure WAHA in Settings first"
                    }>
                    <Send className="size-4" />
                    Send via WAHA
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> "Send to Group" opens WhatsApp chats
                    in browser. "Send via WAHA" sends directly through WhatsApp
                    if configured. Preview links to test before sending to all
                    contacts.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 m-0 h-full">
              {group.sentHistory.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <History className="size-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1">
                    No message history
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Send your first message to see history here
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50 hover:bg-gray-50">
                        <TableHead className="font-semibold text-gray-700">
                          Sent Date
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Contact
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Phone
                        </TableHead>
                        <TableHead className="font-semibold text-gray-700">
                          Message
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {group.sentHistory.map((h) => (
                        <TableRow
                          key={h.id}
                          className="hover:bg-gray-50 transition-colors">
                          <TableCell className="text-sm text-gray-600">
                            {new Date(h.sentAt).toLocaleDateString()}
                            <br />
                            <span className="text-xs text-gray-500">
                              {new Date(h.sentAt).toLocaleTimeString()}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium text-gray-900">
                            {h.name}
                          </TableCell>
                          <TableCell className="font-mono text-sm text-gray-600">
                            {h.phone}
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div
                              className="text-sm text-gray-900 line-clamp-2"
                              title={h.message}>
                              {h.message}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {group && (
          <>
            <EditGroupDialog
              groupId={group.id}
              initialName={group.name}
              open={isEditGroupOpen}
              onOpenChange={setIsEditGroupOpen}
              onUpdated={(newName) => {
                setGroup((prev) => prev ? { ...prev, name: newName } : undefined);
                onRefresh();
              }}
            />
            <DeleteGroupAlert
              groupId={group.id}
              groupName={group.name}
              open={isDeleteGroupAlertOpen}
              onOpenChange={setIsDeleteGroupAlertOpen}
              onDeleted={() => {
                onOpenChange(false); // Close the detail dialog
                onRefresh(); // Refresh the groups list
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailDialog;