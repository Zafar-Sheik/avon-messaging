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
import { cn } from "@/lib/utils";

type ColorKey = "emerald" | "amber" | "indigo" | "violet" | "rose" | "sky" | "teal";

const colorMap: Record<ColorKey, { card: string; icon: string; title: string; desc: string }> = {
  emerald: {
    card: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900 border-emerald-200 dark:border-emerald-800",
    icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200",
    title: "text-emerald-800 dark:text-emerald-100",
    desc: "text-emerald-700 dark:text-emerald-200",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900 border-amber-200 dark:border-amber-800",
    icon: "bg-amber-100 text-amber-700 dark:bg-amber-800 dark:text-amber-200",
    title: "text-amber-800 dark:text-amber-100",
    desc: "text-amber-700 dark:text-amber-200",
  },
  indigo: {
    card: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950 dark:to-indigo-900 border-indigo-200 dark:border-indigo-800",
    icon: "bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-200",
    title: "text-indigo-800 dark:text-indigo-100",
    desc: "text-indigo-700 dark:text-indigo-200",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900 border-violet-200 dark:border-violet-800",
    icon: "bg-violet-100 text-violet-700 dark:bg-violet-800 dark:text-violet-200",
    title: "text-violet-800 dark:text-violet-100",
    desc: "text-violet-700 dark:text-violet-200",
  },
  rose: {
    card: "bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-950 dark:to-rose-900 border-rose-200 dark:border-rose-800",
    icon: "bg-rose-100 text-rose-700 dark:bg-rose-800 dark:text-rose-200",
    title: "text-rose-800 dark:text-rose-100",
    desc: "text-rose-700 dark:text-rose-200",
  },
  sky: {
    card: "bg-gradient-to-br from-sky-50 to-sky-100 dark:from-sky-950 dark:to-sky-900 border-sky-200 dark:border-sky-800",
    icon: "bg-sky-100 text-sky-700 dark:bg-sky-800 dark:text-sky-200",
    title: "text-sky-800 dark:text-sky-100",
    desc: "text-sky-700 dark:text-sky-200",
  },
  teal: {
    card: "bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950 dark:to-teal-900 border-teal-200 dark:border-teal-800",
    icon: "bg-teal-100 text-teal-700 dark:bg-teal-800 dark:text-teal-200",
    title: "text-teal-800 dark:text-teal-100",
    desc: "text-teal-700 dark:text-teal-200",
  },
};

const hashToIndex = (id: string, n: number) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % n;
};
const pickColor = (id: string): ColorKey => {
  const keys: ColorKey[] = ["emerald", "amber", "indigo", "violet", "rose", "sky", "teal"];
  return keys[hashToIndex(id, keys.length)];
};

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
            {groups.map((g) => {
              const styles = colorMap[pickColor(g.id)];
              return (
                <Card key={g.id} className={cn("hover:shadow-md transition-shadow border", styles.card)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-base", styles.title)}>{g.name}</CardTitle>
                      <span className={cn("p-2 rounded-md", styles.icon)}>
                        <Users className="size-4" />
                      </span>
                    </div>
                    <CardDescription className={cn("text-xs", styles.desc)}>
                      Contacts: {g.contacts.length} • Sent: {g.sentHistory.length}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn("flex items-center gap-3 text-sm", styles.desc)}>
                      <div className="flex-1">Manage contacts and view sent history.</div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-end">
                    <Button size="sm" onClick={() => setActiveGroupId(g.id)}>
                      Open
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
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