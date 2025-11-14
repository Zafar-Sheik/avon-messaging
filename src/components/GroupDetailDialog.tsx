"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showError, showSuccess } from "@/utils/toast";
import ContactImport from "@/components/ContactImport";
import { getGroupById, addContactsToGroup, sendGroupMessage, formatWhatsAppLink, updateContactInGroup, deleteContactFromGroup } from "@/utils/groupStore";
import type { Group } from "@/types/group";
import { ExternalLink, Send, Paperclip, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { isWahaConfigured, sendTextMessage, sendFileMessage, sendTextToChat, sendFileToChat, getSessionStatus } from "@/utils/wahaClient";
import { getCompanyProfile } from "@/utils/companyStore";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import SendProgress from "@/components/SendProgress";

type Props = {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

const GroupDetailDialog: React.FC<Props> = ({ groupId, open, onOpenChange, onRefresh }) => {
  const [group, setGroup] = React.useState<Group | undefined>(getGroupById(groupId));
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [chatIds, setChatIds] = React.useState<string>(""); // WhatsApp group chat IDs input
  const [selectedContactId, setSelectedContactId] = React.useState<string | null>(group?.contacts[0]?.id ?? null);
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  const [isSending, setIsSending] = React.useState(false);
  const [sendCurrent, setSendCurrent] = React.useState(0);
  const [sendTotal, setSendTotal] = React.useState(0);

  React.useEffect(() => {
    const g = getGroupById(groupId);
    setGroup(g);
    setSelectedContactId(g?.contacts[0]?.id ?? null);
  }, [groupId, open]);

  React.useEffect(() => {
    if (!group) return;
    const selected = group.contacts.find((c) => c.id === selectedContactId);
    setEditName(selected?.name ?? "");
    setEditPhone(selected?.phone ?? "");
  }, [selectedContactId, group]);

  const handleAddContact = () => {
    const name = newName.trim();
    const phone = newPhone.trim();
    if (!phone) {
      showError("Please enter a phone number.");
      return;
    }
    const updated = addContactsToGroup(groupId, [{ name, phone }]);
    if (updated) {
      setGroup(updated);
      setNewName("");
      setNewPhone("");
      onRefresh();
      showSuccess("Contact added.");
    } else {
      showError("Failed to add contact (possibly duplicate phone).");
    }
  };

  const handleUpdateContact = () => {
    if (!group || !selectedContactId) return;
    const updated = updateContactInGroup(groupId, selectedContactId, {
      name: editName,
      phone: editPhone,
    });
    if (updated) {
      setGroup(updated);
      onRefresh();
      showSuccess("Contact updated.");
    } else {
      showError("Failed to update contact (check phone and duplicates).");
    }
  };

  const handleDeleteContact = () => {
    if (!group || !selectedContactId) return;
    const updated = deleteContactFromGroup(groupId, selectedContactId);
    if (updated) {
      setGroup(updated);
      const nextFirst = updated.contacts[0]?.id ?? null;
      setSelectedContactId(nextFirst);
      onRefresh();
      showSuccess("Contact deleted.");
    } else {
      showError("Failed to delete contact.");
    }
  };

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

  // Add helpers to build message with reply link
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

  const handleSendViaWaha = async () => {
    if (!group) return;
    if (!isWahaConfigured()) {
      showError("Please configure WAHA in Settings to send messages and media.");
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      showError("Add a message or attach files to send.");
      return;
    }

    const finalMessage = await buildMessageWithReply(message);

    const totalOps = group.contacts.length * (attachments.length > 0 ? attachments.length : 1);
    setIsSending(true);
    setSendCurrent(0);
    setSendTotal(totalOps);
    try {
      for (const c of group.contacts) {
        if (attachments.length > 0) {
          for (const file of attachments) {
            const base64 = await readFileAsBase64(file);
            await sendFileMessage(c.phone, file.name, file.type || "application/octet-stream", base64, finalMessage.trim() || undefined);
            setSendCurrent((prev) => prev + 1);
          }
        } else {
          await sendTextMessage(c.phone, finalMessage);
          setSendCurrent((prev) => prev + 1);
        }
      }
    } finally {
      setIsSending(false);
    }

    const { updated } = sendGroupMessage(groupId, finalMessage);
    if (updated) {
      setGroup(updated);
      setMessage("");
      setAttachments([]);
      onRefresh();
    }
    showSuccess(`Sent WAHA message${attachments.length ? " with attachments" : ""} to ${group.contacts.length} contact(s).`);
  };

  const handleImport = (contacts: Array<{ name: string; phone: string }>) => {
    const updated = addContactsToGroup(groupId, contacts);
    if (updated) {
      setGroup(updated);
      onRefresh();
      showSuccess(`Imported ${contacts.length} contact(s) into "${updated.name}".`);
    } else {
      showError("Failed to import contacts.");
    }
  };

  const openWhatsAppWindows = (links: string[]) => {
    // Attempt to open links; popup blockers may prevent opening many tabs.
    let opened = 0;
    for (const url of links) {
      const win = window.open(url, "_blank");
      if (win) opened++;
    }
    return opened;
  };

  const handleSend = async () => {
    if (!group) return;
    if (!message.trim()) {
      showError("Please enter a message.");
      return;
    }
    const finalMessage = await buildMessageWithReply(message);
    const { links, updated } = sendGroupMessage(groupId, finalMessage);
    const opened = openWhatsAppWindows(links);
    showSuccess(`Prepared ${links.length} WhatsApp chats. Opened ${opened} tab(s).`);
    if (updated) {
      setGroup(updated);
      setMessage("");
      onRefresh();
    }
  };

  const handleSendToWahaChats = async () => {
    if (!isWahaConfigured()) {
      showError("Please configure WAHA in Settings to send messages and media.");
      return;
    }
    const ids = chatIds.split(/[\s,]+/).map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) {
      showError("Enter at least one WhatsApp group chat ID (e.g., 12345-67890@g.us).");
      return;
    }
    if (!message.trim() && attachments.length === 0) {
      showError("Add a message or attach files to send.");
      return;
    }

    const finalMessage = await buildMessageWithReply(message);

    const totalOps = ids.length * (attachments.length > 0 ? attachments.length : 1);
    setIsSending(true);
    setSendCurrent(0);
    setSendTotal(totalOps);
    try {
      for (const gid of ids) {
        if (attachments.length > 0) {
          for (const file of attachments) {
            const base64 = await readFileAsBase64(file);
            await sendFileToChat(gid, file.name, file.type || "application/octet-stream", base64, finalMessage.trim() || undefined);
            setSendCurrent((prev) => prev + 1);
          }
        } else {
          await sendTextToChat(gid, finalMessage);
          setSendCurrent((prev) => prev + 1);
        }
      }
    } finally {
      setIsSending(false);
    }

    showSuccess(`Sent WAHA message${attachments.length ? " with attachments" : ""} to ${ids.length} WhatsApp group chat(s).`);
    setMessage("");
    setAttachments([]);
  };

  if (!group) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="truncate">{group.name}</DialogTitle>
          <DialogDescription>
            Manage contacts, import from Excel, send a WhatsApp message, and review sent history.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="contacts">Contacts ({group.contacts.length})</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            <TabsTrigger value="history">History ({group.sentHistory.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-3 pt-3">
            <div className="rounded-md border p-3 space-y-2">
              <div className="text-sm font-medium">Add Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="new-contact-name">Name</Label>
                  <Input id="new-contact-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Optional" />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="new-contact-phone">Phone</Label>
                  <Input id="new-contact-phone" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="e.g., +123456789" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddContact}>Add Contact</Button>
              </div>
            </div>
            {group.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet. Import some from Excel.</p>
            ) : (
              <div className="rounded-md border bg-card">
                <ResizablePanelGroup direction="horizontal" className="min-h-[300px] overflow-hidden">
                  <ResizablePanel defaultSize={40} minSize={25} className="border-r min-w-0">
                    <div className="overflow-auto min-w-0">
                      <Table className="table-fixed w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12 px-2 py-1 text-xs">#</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Name</TableHead>
                            <TableHead className="px-2 py-1 text-xs">Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.contacts.map((c, idx) => (
                            <TableRow
                              key={c.id}
                              onClick={() => setSelectedContactId(c.id)}
                              className={`cursor-pointer ${c.id === selectedContactId ? "bg-muted/50" : "hover:bg-muted/30"}`}
                            >
                              <TableCell className="px-2 py-1.5 text-xs text-muted-foreground">{idx + 1}</TableCell>
                              <TableCell className="px-2 py-1.5 text-xs truncate">{c.name || "Unnamed"}</TableCell>
                              <TableCell className="px-2 py-1.5 text-xs font-mono whitespace-nowrap">{c.phone}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel defaultSize={60} minSize={35} className="p-3 min-w-0 overflow-auto">
                    {(() => {
                      const selected = group.contacts.find((c) => c.id === selectedContactId);
                      if (!selected) {
                        return (
                          <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                            Select a contact from the list to view details.
                          </div>
                        );
                      }
                      return (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <div className="truncate text-base font-semibold">{selected.name || "Unnamed contact"}</div>
                              <div className="font-mono text-sm text-muted-foreground whitespace-nowrap">{selected.phone}</div>
                            </div>
                          </div>
                          <div className="rounded-md border p-3 text-sm">
                            <p className="text-muted-foreground">
                              Edit this contact's details below.
                            </p>
                          </div>
                          <div className="rounded-md border p-3 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                              <div className="space-y-1">
                                <Label htmlFor="edit-contact-name">Name</Label>
                                <Input id="edit-contact-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="edit-contact-phone">Phone</Label>
                                <Input id="edit-contact-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={handleUpdateContact}>Save Changes</Button>
                              <Button variant="destructive" onClick={handleDeleteContact}>Delete Contact</Button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              </div>
            )}
          </TabsContent>

          <TabsContent value="import" className="pt-3">
            <ContactImport onImported={handleImport} />
          </TabsContent>

          <TabsContent value="send" className="space-y-3 pt-3">
            {isSending && (
              <SendProgress current={sendCurrent} total={sendTotal} title="Sending via WAHA" />
            )}
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type the WhatsApp message to send to all contacts in this group..."
              className="min-h-24"
            />
            <div className="rounded-md border p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Paperclip className="h-4 w-4" />
                  <span>Attachments (optional)</span>
                </div>
                {attachments.length > 0 && (
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground"
                    onClick={() => setAttachments([])}
                  >
                    Clear all
                  </button>
                )}
              </div>
              <Input
                type="file"
                multiple
                accept="image/*,application/*"
                onChange={(e) => setAttachments(e.target.files ? Array.from(e.target.files) : [])}
              />
              {attachments.length > 0 && (
                <div className="rounded-md border">
                  <div className="max-h-40 overflow-auto divide-y">
                    {attachments.map((f, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">{f.name}</div>
                          <div className="text-xs text-muted-foreground">{f.type || "Unknown"} • {(f.size / 1024).toFixed(1)} KB</div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          title="Remove"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-md border p-3 space-y-2">
              <div className="text-sm font-medium">WhatsApp Group Chat IDs (via WAHA)</div>
              <Input
                value={chatIds}
                onChange={(e) => setChatIds(e.target.value)}
                placeholder="e.g., 12345-67890@g.us, 22222-33333@g.us"
              />
              <p className="text-xs text-muted-foreground">
                Paste WhatsApp group chat IDs ending with <span className="font-mono">@g.us</span>, separated by commas or spaces.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button onClick={handleSend}>
                <Send className="size-4" />
                <span>Send to Group</span>
              </Button>
              <Button
                variant="secondary"
                disabled={isSending || group.contacts.length === 0 || !message.trim()}
                onClick={async () => {
                  const final = await buildMessageWithReply(message);
                  const preview = group.contacts.map((c) => formatWhatsAppLink(c.phone, final));
                  const sample = preview.slice(0, 5);
                  showSuccess(`Previewing ${preview.length} link(s). Opening up to 5 samples.`);
                  for (const url of sample) window.open(url, "_blank");
                }}
              >
                <ExternalLink className="size-4" />
                <span>Preview Links</span>
              </Button>
              <Button
                variant="default"
                disabled={isSending || !isWahaConfigured() || group.contacts.length === 0 || (!message.trim() && attachments.length === 0)}
                onClick={handleSendViaWaha}
                title={isWahaConfigured() ? "Send via WAHA" : "Configure WAHA in Settings first"}
              >
                <Send className="size-4" />
                <span>Send via WAHA</span>
              </Button>
              <Button
                variant="default"
                disabled={isSending || !isWahaConfigured() || (!message.trim() && attachments.length === 0) || chatIds.trim() === ""}
                onClick={handleSendToWahaChats}
                title={isWahaConfigured() ? "Send to WhatsApp group chats via WAHA" : "Configure WAHA in Settings first"}
              >
                <Send className="size-4" />
                <span>Send to Chats via WAHA</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Note: "Send to Group" opens WhatsApp chats using browser links (text only). Use "Send via WAHA" to send text and attachments directly to contacts. 
              Use "Send to Chats via WAHA" to send to WhatsApp group chat IDs you provide above.
            </p>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 pt-3">
            {group.sentHistory.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sent history yet.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sent At</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.sentHistory.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell>{new Date(h.sentAt).toLocaleString()}</TableCell>
                        <TableCell>{h.name}</TableCell>
                        <TableCell>{h.phone}</TableCell>
                        <TableCell className="max-w-xs truncate" title={h.message}>
                          {h.message}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailDialog;