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

type ColorKey = "emerald" | "amber" | "indigo" | "violet" | "rose" | "sky" | "teal" | "blue" | "cyan" | "fuchsia" | "lime" | "orange";

const colorMap: Record<ColorKey, { card: string; icon: string; title: string; desc: string }> = {
  emerald: {
    card: "bg-gradient-to-br from-emerald-500 to-emerald-700 dark:from-emerald-900 dark:to-emerald-950 border-emerald-600 dark:border-emerald-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  amber: {
    card: "bg-gradient-to-br from-amber-500 to-amber-700 dark:from-amber-900 dark:to-amber-950 border-amber-600 dark:border-amber-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  indigo: {
    card: "bg-gradient-to-br from-indigo-500 to-indigo-700 dark:from-indigo-900 dark:to-indigo-950 border-indigo-600 dark:border-indigo-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  violet: {
    card: "bg-gradient-to-br from-violet-500 to-violet-700 dark:from-violet-900 dark:to-violet-950 border-violet-600 dark:border-violet-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  rose: {
    card: "bg-gradient-to-br from-rose-500 to-rose-700 dark:from-rose-900 dark:to-rose-950 border-rose-600 dark:border-rose-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  sky: {
    card: "bg-gradient-to-br from-sky-500 to-sky-700 dark:from-sky-900 dark:to-sky-950 border-sky-600 dark:border-sky-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  teal: {
    card: "bg-gradient-to-br from-teal-500 to-teal-700 dark:from-teal-900 dark:to-teal-950 border-teal-600 dark:border-teal-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  blue: {
    card: "bg-gradient-to-br from-blue-500 to-blue-700 dark:from-blue-900 dark:to-blue-950 border-blue-600 dark:border-blue-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  cyan: {
    card: "bg-gradient-to-br from-cyan-500 to-cyan-700 dark:from-cyan-900 dark:to-cyan-950 border-cyan-600 dark:border-cyan-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  fuchsia: {
    card: "bg-gradient-to-br from-fuchsia-500 to-fuchsia-700 dark:from-fuchsia-900 dark:to-fuchsia-950 border-fuchsia-600 dark:border-fuchsia-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  lime: {
    card: "bg-gradient-to-br from-lime-500 to-lime-700 dark:from-lime-900 dark:to-lime-950 border-lime-600 dark:border-lime-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
  orange: {
    card: "bg-gradient-to-br from-orange-500 to-orange-700 dark:from-orange-900 dark:to-orange-950 border-orange-600 dark:border-orange-800 text-white",
    icon: "bg-white/20 text-white",
    title: "text-white",
    desc: "text-white/80",
  },
};

const hashToIndex = (id: string, n: number) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h % n;
};
const pickColor = (id: string): ColorKey => {
  const keys: ColorKey[] = ["emerald", "amber", "indigo", "violet", "rose", "sky", "teal", "blue", "cyan", "fuchsia", "lime", "orange"];
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return keys[h % keys.length];
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {groups.map((g) => {
              const styles = colorMap[pickColor(g.id)];
              return (
                <Card key={g.id} className={cn("hover:shadow-md transition-shadow border p-3", styles.card)}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className={cn("text-sm", styles.title)}>{g.name}</CardTitle>
                      <span className={cn("p-1 rounded-md", styles.icon)}>
                        <Users className="size-3" />
                      </span>
                    </div>
                    <CardDescription className={cn("text-[11px]", styles.desc)}>
                      {g.contacts.length} contacts • {g.sentHistory.length} sent
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0 justify-end">
                    <Button size="sm" variant="outline" className="h-8 px-2" onClick={() => setActiveGroupId(g.id)}>
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