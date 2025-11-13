"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getGroups, createGroup } from "@/utils/groupStore";
import GroupDetailDialog from "@/components/GroupDetailDialog";
import { showError, showSuccess } from "@/utils/toast";
import { Plus, Users } from "lucide-react";

const GroupManager: React.FC = () => {
  const [groups, setGroups] = React.useState(getGroups());
  const [newName, setNewName] = React.useState("");
  const [activeGroupId, setActiveGroupId] = React.useState<string | null>(null);

  const refresh = () => setGroups(getGroups());

  const addGroup = () => {
    const name = newName.trim();
    if (!name) {
      showError("Please enter a group name.");
      return;
    }
    const g = createGroup(name);
    setNewName("");
    refresh();
    showSuccess(`Created group "${g.name}".`);
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-4 space-y-6">
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Users className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Groups</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="New group name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Button onClick={addGroup}>
            <Plus className="size-4" />
            <span>Create Group</span>
          </Button>
        </div>
      </Card>

      <Card className="p-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <Card key={g.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{g.name}</CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                  </div>
                  <CardDescription className="text-xs">
                    Contacts: {g.contacts.length} • Sent: {g.sentHistory.length}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex-1">Manage contacts and view sent history.</div>
                  </div>
                </CardContent>
                <CardFooter className="justify-end">
                  <Button size="sm" onClick={() => setActiveGroupId(g.id)}>
                    Open
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </Card>

      {activeGroupId && (
        <GroupDetailDialog
          groupId={activeGroupId}
          open={!!activeGroupId}
          onOpenChange={(open) => !open && setActiveGroupId(null)}
          onRefresh={refresh}
        />
      )}
    </div>
  );
};

export default GroupManager;