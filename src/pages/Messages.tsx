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
import { getGroups } from "@/utils/groupStore";
import { getWhatsAppStats } from "@/utils/stats";
import { MessageSquare, Send, Clock, Users, BarChart3 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import MessageSender from "@/components/MessageSender"; // Import the new component
import type { Contact } from "@/types/group";

const MessagesPage = () => {
  const [groups, setGroups] = React.useState(getGroups());
  const [stats, setStats] = React.useState(getWhatsAppStats());
  const [selectedGroupId, setSelectedGroupId] = React.useState<string>("");

  React.useEffect(() => {
    setGroups(getGroups());
    setStats(getWhatsAppStats());
  }, []);

  const history = groups.flatMap((g) =>
    g.sentHistory.map((h) => ({ ...h, groupName: g.name }))
  );

  const handleMessageSent = (message: string, contacts: Contact[]) => {
    // Refresh groups and stats after a message is sent
    setGroups(getGroups());
    setStats(getWhatsAppStats());
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
              Track all your WhatsApp messages and send new broadcasts
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
            description="Across all groups"
          />
        </div>

        {/* Send Broadcast Section */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <Send className="size-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Send New Broadcast
              </h2>
              <p className="text-gray-600 text-sm">
                Select a group and send a WhatsApp message to all its contacts.
              </p>
            </div>
          </div>

          <div className="space-y-4">
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
          </div>
        </Card>

        {/* Message History Table */}
        <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Message History
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                All sent messages across your groups
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
                Start sending WhatsApp messages to your groups to see the
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