"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { getGroups, getAllContacts, getOrCreateDirectMessagesGroup } from "@/utils/groupStore"; // NEW: Import getAllContacts and getOrCreateDirectMessagesGroup
import { getWhatsAppStats } from "@/utils/stats";
import { MessageSquare, Send, Clock, Users, BarChart3, User } from "lucide-react"; // NEW: Import User icon
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MessageSender from "@/components/MessageSender";
import DirectMessageSender from "@/components/DirectMessageSender"; // NEW: Import DirectMessageSender
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // NEW: Import Tabs components
import type { Contact } from "@/types/group";

const MessagesPage = () => {
  const [groups, setGroups] = React.useState(getGroups());
  const [stats, setStats] = React.useState(getWhatsAppStats());
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");
  const [allContacts, setAllContacts] = React.useState<Contact[]>([]); // NEW: State for all contacts

  React.useEffect(() => {
    const refreshData = () => {
      setGroups(getGroups());
      setStats(getWhatsAppStats());
      setAllContacts(getAllContacts()); // NEW: Load all contacts
      getOrCreateDirectMessagesGroup(); // Ensure the "Direct Messages" group exists
    };
    refreshData(); // Initial load

    // You might want to set up an interval or event listener to refresh data if it changes elsewhere
    // For now, a simple refresh on mount is sufficient.
  }, []);

  const history = groups.flatMap((g) =>
    g.sentHistory.map((h) => ({ ...h, groupName: g.name }))
  );

  const handleMessageSent = (message: string, contacts: Contact[]) => {
    // Refresh groups and stats after a message is sent
    setGroups(getGroups());
    setStats(getWhatsAppStats());
    setAllContacts(getAllContacts()); // Refresh all contacts as well
  };

  const StatCard = ({
    icon,
    label,
    value,
    description,
  }: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    description?: string;
  }) => (
    <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              {icon}
            </div>
          </div>
          <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
          <div className="text-2xl font-bold text-gray-900">{value}</div>
          {description && (
            <div className="text-xs text-gray-500 mt-2">{description}</div>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-full mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <MessageSquare className="size-8 text-blue-600" />
              Message History & Send
            </h1>
            <p className="text-gray-600 text-lg mt-2">
              Track all your WhatsApp messages and send new broadcasts or direct messages
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Send className="size-5" />}
            label="Total Sent"
            value={stats.sentCount.toLocaleString()}
            description="All time messages"
          />
          <StatCard
            icon={<Clock className="size-5" />}
            label="Pending"
            value={stats.pendingCount.toLocaleString()}
            description="Awaiting delivery"
          />
          <StatCard
            icon={<Users className="size-5" />}
            label="Active Groups"
            value={groups.length.toLocaleString()}
            description="With message history"
          />
          <StatCard
            icon={<BarChart3 className="size-5" />}
            label="Total Messages"
            value={history.length.toLocaleString()}
            description="Across all groups and direct messages"
          />
        </div>

        {/* Send Message Section (Tabs for Broadcast vs Direct) */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="size-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Send Messages
              </h2>
              <p className="text-gray-600 text-sm">
                Choose to send a broadcast to a group or a direct message to an individual contact.
              </p>
            </div>
          </div>

          <Tabs defaultValue="broadcast" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="broadcast" className="flex items-center gap-2">
                <Users className="size-4" />
                Group Broadcast
              </TabsTrigger>
              <TabsTrigger value="direct" className="flex items-center gap-2">
                <User className="size-4" />
                Direct Message
              </TabsTrigger>
            </TabsList>

            <TabsContent value="broadcast" className="pt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="select-group-to-send">Select Group</Label>
                <Select
                  value={selectedGroupId}
                  onValueChange={setSelectedGroupId}
                >
                  <SelectTrigger id="select-group-to-send" className="w-full md:w-96">
                    <SelectValue placeholder="Choose a group to send to" />
                  </SelectTrigger>
                  <SelectContent>
                    {groups.length === 0 ? (
                      <SelectItem value="__none" disabled>
                        No groups found
                      </SelectItem>
                    ) : (
                      groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>
                          <div className="flex items-center gap-2">
                            {g.name}
                            <span className="text-xs text-muted-foreground">
                              ({g.contacts.length} contacts)
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {selectedGroupId && (
                <MessageSender
                  groupId={selectedGroupId}
                  onMessageSent={handleMessageSent}
                />
              )}
            </TabsContent>

            <TabsContent value="direct" className="pt-4 space-y-4">
              <DirectMessageSender
                allContacts={allContacts}
                onMessageSent={handleMessageSent}
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Message History Table */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Message History
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                All sent messages across your groups and direct messages
              </p>
            </div>
            <Badge variant="secondary" className="text-sm font-medium">
              {history.length} messages
            </Badge>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <MessageSquare className="size-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No messages sent yet
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                Start sending WhatsApp messages to your groups or directly to contacts to see the
                history here.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="font-semibold text-gray-700">
                      Group
                    </TableHead>
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
                  {history.map((h) => (
                    <TableRow
                      key={h.id}
                      className="hover:bg-gray-50 transition-colors group">
                      <TableCell>
                        <div className="font-medium text-gray-900">
                          {h.groupName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-900">
                          {new Date(h.sentAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(h.sentAt).toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900">
                        {h.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-gray-600">
                        {h.phone}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div
                          className="text-sm text-gray-900 line-clamp-2 group-hover:line-clamp-none transition-all"
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
        </Card>

        {/* Summary Footer */}
        {history.length > 0 && (
          <Card className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between text-sm text-blue-700">
              <div className="flex items-center gap-4">
                <span>
                  <strong>Total Records:</strong> {history.length}
                </span>
                <span>
                  <strong>Unique Groups:</strong>{" "}
                  {new Set(history.map((h) => h.groupName)).size}
                </span>
                <span>
                  <strong>Unique Contacts:</strong>{" "}
                  {new Set(history.map((h) => h.phone)).size}
                </span>
              </div>
              <div className="mt-2 sm:mt-0">
                Last updated: {new Date().toLocaleString()}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;