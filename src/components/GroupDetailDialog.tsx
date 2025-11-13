"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { showError, showSuccess } from "@/utils/toast";
import ContactImport from "@/components/ContactImport";
import { getGroupById, addContactsToGroup, sendGroupMessage, formatWhatsAppLink } from "@/utils/groupStore";
import type { Group } from "@/types/group";
import { ExternalLink, Send } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  groupId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRefresh: () => void;
};

const GroupDetailDialog: React.FC<Props> = ({ groupId, open, onOpenChange, onRefresh }) => {
  const [group, setGroup] = React.useState<Group | undefined>(getGroupById(groupId));
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setGroup(getGroupById(groupId));
  }, [groupId, open]);

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

  const handleSend = () => {
    if (!group) return;
    if (!message.trim()) {
      showError("Please enter a message.");
      return;
    }
    const { links, updated } = sendGroupMessage(groupId, message);
    const opened = openWhatsAppWindows(links);
    showSuccess(`Prepared ${links.length} WhatsApp chats. Opened ${opened} tab(s).`);
    if (updated) {
      setGroup(updated);
      setMessage("");
      onRefresh();
    }
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
            {group.contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contacts yet. Import some from Excel.</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {group.contacts.map((c) => (
                      <TableRow key={c.id}>
                        <TableCell>{c.name}</TableCell>
                        <TableCell>{c.phone}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
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
            <div className="flex items-center gap-2">
              <Button onClick={handleSend}>
                <Send className="size-4" />
                <span>Send to Group</span>
              </Button>
              <Button
                variant="secondary"
                disabled={group.contacts.length === 0 || !message.trim()}
                onClick={() => {
                  const preview = group.contacts.map((c) => formatWhatsAppLink(c.phone, message));
                  const sample = preview.slice(0, 5);
                  showSuccess(`Previewing ${preview.length} link(s). Opening up to 5 samples.`);
                  for (const url of sample) window.open(url, "_blank");
                }}
              >
                <ExternalLink className="size-4" />
                <span>Preview Links</span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Browsers may block multiple popups. If some chats don't open, click the preview and open links manually.
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