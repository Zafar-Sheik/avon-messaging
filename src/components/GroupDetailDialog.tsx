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
  recordGroupMessageSent,
  formatWhatsAppLink,
} from "@/utils/groupStore";
import type { Group, Contact } from "@/types/group";
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
  MoreVertical,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import EditGroupDialog from "@/components/EditGroupDialog";
import DeleteGroupAlert from "@/components/DeleteGroupAlert";
import MessageSender from "@/components/MessageSender"; // Import the new component

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
  const [message, setMessage] = React.useState(""); // Keep for now if needed for other parts, but MessageSender manages its own.
  const [attachments, setAttachments] = React.useState<File[]>([]); // Keep for now if needed for other parts, but MessageSender manages its own.
  const tabsRef = React.useRef<HTMLButtonElement>(null);
  const [activeTab, setActiveTab] = React.useState("contacts");

  const [isEditGroupOpen, setIsEditGroupOpen] = React.useState(false);
  const [isDeleteGroupAlertOpen, setIsDeleteGroupAlertOpen] =
    React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    setGroup(getGroupById(groupId));
  }, [groupId, open]);

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

  // Callback for MessageSender when a message is successfully sent
  const handleMessageSent = (sentMessage: string, contactsSent: Contact[]) => {
    // The MessageSender component already handles recording history and showing toast.
    // We just need to refresh the group state in this dialog and notify the parent.
    setGroup(getGroupById(groupId));
    onRefresh();
  };

  const handleImportContactsClick = () => {
    setActiveTab("import");
    if (tabsRef.current) {
      tabsRef.current.click();
    }
  };

  if (!group) return null;

  // Mobile contact list component
  const MobileContactList = () => (
    <div className="space-y-2">
      {group.contacts.map((contact) => (
        <div
          key={contact.id}
          className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex-1 min-w-0">
            <div className="font-medium text-gray-900 truncate">
              {contact.name}
            </div>
            <div className="text-sm text-gray-600 font-mono truncate">
              {contact.phone}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(formatWhatsAppLink(contact.phone, ""), "_blank")
            }
            className="flex-shrink-0 ml-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
            <Phone className="size-4" />
          </Button>
        </div>
      ))}
    </div>
  );

  // Mobile history list component
  const MobileHistoryList = () => (
    <div className="space-y-3">
      {group.sentHistory.map((history) => (
        <div
          key={history.id}
          className="p-3 bg-white border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 truncate">
                {history.name}
              </div>
              <div className="text-sm text-gray-600 font-mono truncate">
                {history.phone}
              </div>
            </div>
            <div className="text-xs text-gray-500 text-right flex-shrink-0 ml-2">
              {new Date(history.sentAt).toLocaleDateString()}
              <br />
              {new Date(history.sentAt).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-sm text-gray-900 line-clamp-3">
            {history.message}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90dvh] overflow-hidden flex flex-col p-0 sm:p-6">
        <DialogHeader className="px-4 sm:px-0 pb-4 pt-4 sm:pt-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Users className="size-5 text-blue-600" />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
                {group.name}
              </DialogTitle>
              <DialogDescription className="flex flex-wrap gap-2 mt-1">
                <span className="flex items-center gap-1 text-xs sm:text-sm">
                  <Users className="size-3 sm:size-4" />
                  {group.contacts.length} contacts
                </span>
                <span className="flex items-center gap-1 text-xs sm:text-sm">
                  <MessageSquare className="size-3 sm:size-4" />
                  {group.sentHistory.length} messages
                </span>
                <span className="flex items-center gap-1 text-xs sm:text-sm">
                  <Calendar className="size-3 sm:size-4" />
                  {new Date(group.createdAt || group.id).toLocaleDateString()}
                </span>
              </DialogDescription>
            </div>

            {/* Mobile menu button */}
            <div className="sm:hidden relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="h-9 w-9 p-0">
                <MoreVertical className="size-4" />
              </Button>

              {/* Mobile dropdown menu */}
              {isMobileMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-1">
                  <button
                    onClick={() => {
                      setIsEditGroupOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Pencil className="size-4" />
                    Edit Group
                  </button>
                  <button
                    onClick={() => {
                      setIsDeleteGroupAlertOpen(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="size-4" />
                    Delete Group
                  </button>
                </div>
              )}
            </div>

            {/* Desktop buttons */}
            <div className="hidden sm:flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditGroupOpen(true)}>
                <Pencil className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setIsDeleteGroupAlertOpen(true)}>
                <Trash2 className="size-4 sm:mr-2" />
                <span className="hidden sm:inline">Delete</span>
              </Button>
            </div>
          </div>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid grid-cols-4 bg-gray-100 p-1 rounded-lg mx-4 sm:mx-0">
            <TabsTrigger
              value="contacts"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Users className="size-3 sm:size-4" />
              <span className="hidden xs:inline">Contacts</span>
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 text-xs">
                {group.contacts.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="import"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm"
              ref={tabsRef}>
              <Download className="size-3 sm:size-4" />
              <span className="hidden xs:inline">Import</span>
            </TabsTrigger>
            <TabsTrigger
              value="send"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <Send className="size-3 sm:size-4" />
              <span className="hidden xs:inline">Send</span>
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="flex items-center gap-1 sm:gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm text-xs sm:text-sm">
              <History className="size-3 sm:size-4" />
              <span className="hidden xs:inline">History</span>
              <Badge variant="secondary" className="ml-1 h-4 min-w-4 text-xs">
                {group.sentHistory.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto pt-4 px-4 sm:px-0">
            <TabsContent value="contacts" className="space-y-4 m-0 h-full">
              {group.contacts.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <Users className="size-8 sm:size-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                    No contacts yet
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm mb-4">
                    Import contacts from Excel to get started
                  </p>
                  <Button
                    onClick={handleImportContactsClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm">
                    Import Contacts
                  </Button>
                </div>
              ) : (
                <>
                  {/* Mobile view */}
                  <div className="sm:hidden">
                    <MobileContactList />
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
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
                </>
              )}
            </TabsContent>

            <TabsContent value="import" className="m-0 h-full">
              <ContactImport onImported={handleImport} />
            </TabsContent>

            <TabsContent value="send" className="space-y-4 m-0 h-full">
              <MessageSender groupId={groupId} onMessageSent={handleMessageSent} />
            </TabsContent>

            <TabsContent value="history" className="space-y-4 m-0 h-full">
              {group.sentHistory.length === 0 ? (
                <div className="text-center py-8 sm:py-12 bg-gray-50 rounded-lg border border-gray-200">
                  <History className="size-8 sm:size-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium text-gray-900 mb-1 text-sm sm:text-base">
                    No message history
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">
                    Send your first message to see history here
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile view */}
                  <div className="sm:hidden">
                    <MobileHistoryList />
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block rounded-lg border border-gray-200 overflow-hidden">
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
                </>
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
                setGroup((prev) =>
                  prev ? { ...prev, name: newName } : undefined
                );
                onRefresh();
              }}
            />
            <DeleteGroupAlert
              groupId={group.id}
              groupName={group.name}
              open={isDeleteGroupAlertOpen}
              onOpenChange={setIsDeleteGroupAlertOpen}
              onDeleted={() => {
                onOpenChange(false);
                onRefresh();
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GroupDetailDialog;