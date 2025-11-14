"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { getGroups } from "@/utils/groupStore";
import { getWhatsAppStats } from "@/utils/stats";
import BulkBroadcast from "@/components/BulkBroadcast";
import type { Group } from "@/types/group";

const MessagesPage = () => {
  // Replace static groups with state so page reacts to changes
  const [groups, setGroups] = React.useState<Group[]>([]);
  React.useEffect(() => {
    setGroups(getGroups());
  }, []);

  const stats = getWhatsAppStats();

  const history = groups.flatMap((g) =>
    g.sentHistory.map((h) => ({ ...h, groupName: g.name }))
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">WhatsApp Messages</h1>
        <BulkBroadcast onCompleted={() => setGroups(getGroups())} />
        <Card className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="text-sm text-muted-foreground">Sent</div>
            <div className="text-2xl font-semibold">{stats.sentCount}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-semibold">{stats.pendingCount}</div>
          </div>
        </Card>

        <Card className="p-4">
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No messages sent yet.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((h) => (
                    <TableRow key={h.id}>
                      <TableCell className="font-medium">{h.groupName}</TableCell>
                      <TableCell>{new Date(h.sentAt).toLocaleString()}</TableCell>
                      <TableCell>{h.name}</TableCell>
                      <TableCell>{h.phone}</TableCell>
                      <TableCell className="max-w-xs truncate" title={h.message}>{h.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MessagesPage;