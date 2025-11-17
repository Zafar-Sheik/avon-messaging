"use client";

import React from "react";
import { useParams, Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import ContactImport from "@/components/ContactImport";
import { showError, showSuccess } from "@/utils/toast";
import {
  getGroupById,
  addContactsToGroup,
  recordGroupMessageSent, // Renamed from sendGroupMessage
  updateContactInGroup,
  deleteContactFromGroup,
  formatWhatsAppLink,
} from "@/utils/groupStore";
import type { Group } from "@/types/group";
import { Send, Paperclip, Trash2, ArrowLeft, ExternalLink, Phone, Calendar, Pencil, History } from "lucide-react";
import SendProgress from "@/components/SendProgress";
import EditGroupDialog from "@/components/EditGroupDialog";
import DeleteGroupAlert from "@/components/DeleteGroupAlert";
import { getReplyNowLink } from "@/utils/replyLink";
import { sendWhatsAppBroadcast } from "@/utils/whatsappBroadcast"; // New import

// Helper to build message with a hardcoded reply link
const buildMessageWithReply = (original: string): string => {
  const trimmed = (original || "").trim();
  const link = getReplyNowLink();
  if (!link) return trimmed;
  return `${trimmed}\n\nReply now: ${link}`;
};

const GroupDetailPage: React.FC = () => {
  const { id } = useParams();
  const [group, setGroup] = React.useState<Group | undefined>(
    id ? getGroupById(id) : undefined
  );
  const [message, setMessage] = React.useState("");
  const [attachments, setAttachments] = React.useState<File[]>([]);
  const [selectedContactId, setSelectedContactId] = React.useState<
    string | null
  >(group?.contacts[0]?.id ?? null);
  const [newName, setNewName] = React.useState("");
  const [newPhone, setNewPhone] = React.useState("");
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");
  
  const [isEditGroupOpen, setIsEditGroupOpen] = React.useState(false);
  const [isDeleteGroupAlertOpen, setIsDeleteGroupAlertOpen] = React.useState(false);
  const [isSendingBroadcast, setIsSendingBroadcast] = React.useState(false); // State for broadcast loading

  React.useEffect(() => {
    if (!id) return;
    const g = getGroupById(id);
    setGroup(g);
    setSelectedContactId(g?.contacts[0]?.id ?? null);
  }, [id]);

  React.useEffect(() => {
    if (!group) return;
    const selected = group.contacts.find((c) => c.id === selectedContactId);
    setEditName(selected?.name ?? "");
    setEditPhone(selected?.phone ?? "");
  }, [selectedContactId, group]);

  const handleAddContact = () => {
    if (!group) return;
    const name = newName.trim();
    const phone = newPhone.trim();
    if (!phone) {
      showError("Please enter a phone number.");
      return;
    }
    const updated = addContactsToGroup(group.id, [{ name, phone }]);
    if (updated) {
      setGroup(updated);
      setNewName("");
      setNewPhone("");
      refresh();
      showSuccess("Contact added.");
    } else {
      showError("Failed to add contact (possibly duplicate phone).");
    }
  };

  const handleUpdateContact = () => {
    if (!group || !selectedContactId) return;
    const updated = updateContactInGroup(group.id, selectedContactId, {
      name: editName,
      phone: editPhone,
    });
    if (updated) {
      setGroup(updated);
      refresh();
      showSuccess("Contact updated.");
    } else {
      showError("Failed to update contact (check phone and duplicates).");
    }
  };

  const handleDeleteContact = () => {
    if (!group || !selectedContactId) return;
    const updated = deleteContactFromGroup(group.id, selectedContactId);
    if (updated) {
      setGroup(updated);
      const nextFirst = updated.contacts[0]?.id ?? null;
      setSelectedContactId(nextFirst);
      refresh();
      showSuccess("Contact deleted.");
    } else {
      showError("Failed to delete contact.");
    }
  };

  const refresh = () => {
    if (!id) return;
    const g = getGroupById(id);
    setGroup(g);
  };

  const handleImport = (contacts: Array<{ name: string; phone: string }>) => {
    if (!group) return;
    const updated = addContactsToGroup(group.id, contacts);
    if (updated) {
      setGroup(updated);
      refresh();
      showSuccess(
        `Imported ${contacts.length} contact(s) into "${updated.name}".`
      );
    } else {
      showError("Failed to import contacts.");
    }
  };

  const handleSendBroadcast = async () => {
    if (!group) return;
    if (!message.trim()) {
      showError("Please enter a message.");
      return;
    }
    if (group.contacts.length === 0) {
      showError("No contacts in this group to send a broadcast to.");
      return;
    }

    setIsSendingBroadcast(true);
    const finalMessage = buildMessageWithReply(message);
    const result = await sendWhatsAppBroadcast(finalMessage, group.contacts);
    setIsSendingBroadcast(false);

    if (result.success) {
      // Record the message in local history after successful (simulated) broadcast
      const { updated } = recordGroupMessageSent(group.id, finalMessage, group.contacts);
      if (updated) {
        setGroup(updated);
        setMessage("");
        setAttachments([]); // Clear attachments as well
        refresh();
      }
    }
  };

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-full mx-auto p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/groups">
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Groups</span>
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Group not found</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            The requested group does not exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link to="/groups">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Groups</span>
            </Link>
          </Button>
          <h1 className="text-2xl font-bold truncate">{group.name}</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Manage contacts, import from Excel, send WhatsApp messages, and review
          sent history.
        </p>

        <Tabs defaultValue="contacts" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="contacts">
              Contacts ({group.contacts.length})
            </TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="send">Send</TabsTrigger>
            {/* Removed WAHA-specific tab */}
            {/* <TabsTrigger value="send-waha">Send (WAHA)</TabsTrigger> */}
            <TabsTrigger value="history">
              History ({group.sentHistory.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-3 pt-3">
            <div className="rounded-md border p-3 space-y-2">
              <div className="text-sm font-medium">Add Contact</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="new-contact-name">Name</Label>
                  <Input
                    id="new-contact-name"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="new-contact-phone">Phone</Label>
                  <Input
                    id="new-contact-phone"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g., +123456789"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleAddContact}>Add Contact</Button>
              </div>
            </div>
            {group.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No contacts yet. Import some from Excel.
              </p>
            ) : (
              <div className="rounded-md border bg-card">
                <ResizablePanelGroup
                  direction="horizontal"
                  className="min-h-[300px] overflow-hidden">
                  <ResizablePanel
                    defaultSize={40}
                    minSize={25}
                    className="border-r min-w-0">
                    <div className="overflow-auto min-w-0">
                      <Table className="table-fixed w-full">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12 px-2 py-1 text-xs">
                              #
                            </TableHead>
                            <TableHead className="px-2 py-1 text-xs">
                              Name
                            </TableHead>
                            <TableHead className="px-2 py-1 text-xs">
                              Phone
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {group.contacts.map((c, idx) => (
                            <TableRow
                              key={c.id}
                              onClick={() => setSelectedContactId(c.id)}
                              className={`cursor-pointer ${
                                c.id === selectedContactId
                                  ? "bg-muted/50"
                                  : "hover:bg-muted/30"
                              }`}>
                              <TableCell className="px-2 py-1.5 text-xs text-muted-foreground">
                                {idx + 1}
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-xs truncate">
                                {c.name || "Unnamed"}
                              </TableCell>
                              <TableCell className="px-2 py-1.5 text-xs font-mono whitespace-nowrap">
                                {c.phone}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ResizablePanel>

                  <ResizableHandle withHandle />

                  <ResizablePanel
                    defaultSize={60}
                    minSize={35}
                    className="p-3 min-w-0 overflow-auto">
                    {(() => {
                      const selected = group.contacts.find(
                        (c) => c.id === selectedContactId
                      );
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
                              <div className="truncate text-base font-semibold">
                                {selected.name || "Unnamed contact"}
                              </div>
                              <div className="font-mono text-sm text-muted-foreground whitespace-nowrap">
                                {selected.phone}
                              </div>
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
                                <Input
                                  id="edit-contact-name"
                                  value={editName}
                                  onChange={(e) => setEditName(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1 sm:col-span-2">
                                <Label htmlFor="edit-contact-phone">
                                  Phone
                                </Label>
                                <Input
                                  id="edit-contact-phone"
                                  value={editPhone}
                                  onChange={(e) => setEditPhone(e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <Button onClick={handleUpdateContact}>
                                Save Changes
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={handleDeleteContact}>
                                Delete Contact
                              </Button>
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
                    onClick={() => setAttachments([])}>
                    Clear all
                  </button>
                )}
              </div>
              <Input
                type="file"
                multiple
                accept="image/*,application/*"
                onChange={(e) =>
                  setAttachments(
                    e.target.files ? Array.from(e.target.files) : []
                  )
                }
              />
              {attachments.length > 0 && (
                <div className="rounded-md border">
                  <div className="max-h-40 overflow-auto divide-y">
                    {attachments.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-medium">
                            {f.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {f.type || "Unknown"} • {(f.size / 1024).toFixed(1)}{" "}
                            KB
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
                          title="Remove">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleSendBroadcast}
                disabled={isSendingBroadcast || !message.trim() || group.contacts.length === 0}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
                <Send className="size-4" />
                {isSendingBroadcast ? "Sending..." : `Send to ${group.contacts.length} Contacts`}
              </Button>

              <Button
                variant="outline"
                disabled={group.contacts.length === 0 || !message.trim() || isSendingBroadcast}
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
            </div>

            <p className="text-xs text-muted-foreground">
              Use "Send to Contacts" to open WhatsApp chats in your browser. Preview links to test before sending to all
              contacts.
            </p>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 pt-3">
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
                refresh();
              }}
            />
            <DeleteGroupAlert
              groupId={group.id}
              groupName={group.name}
              open={isDeleteGroupAlertOpen}
              onOpenChange={setIsDeleteGroupAlertOpen}
              onDeleted={() => {
                onOpenChange(false); // Close the detail dialog
                refresh(); // Refresh the groups list
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default GroupDetailPage;