"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { getGroups, createGroup } from "@/utils/groupStore";
import GroupDetailDialog from "@/components/GroupDetailDialog";
import EditGroupDialog from "@/components/EditGroupDialog";
import DeleteGroupsAlert from "@/components/DeleteGroupsAlert";
import { Checkbox } from "@/components/ui/checkbox";
import { showError, showSuccess } from "@/utils/toast";
import { Plus, Users, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type ColorKey = "emerald" | "amber" | "indigo" | "violet" | "rose" | "sky" | "teal" | "blue" | "cyan" | "fuchsia" | "lime" | "orange";

const colorMap: Record<ColorKey, { card: string; icon: string; title: string; desc: string }> = {
  emerald: {
    card: "bg-emerald-50 border-emerald-200 text-emerald-900",
    icon: "bg-emerald-100 text-emerald-700",
    title: "text-emerald-900",
    desc: "text-emerald-700",
  },
  amber: {
    card: "bg-amber-50 border-amber-200 text-amber-900",
    icon: "bg-amber-100 text-amber-700",
    title: "text-amber-900",
    desc: "text-amber-700",
  },
  indigo: {
    card: "bg-indigo-50 border-indigo-200 text-indigo-900",
    icon: "bg-indigo-100 text-indigo-700",
    title: "text-indigo-900",
    desc: "text-indigo-700",
  },
  violet: {
    card: "bg-violet-50 border-violet-200 text-violet-900",
    icon: "bg-violet-100 text-violet-700",
    title: "text-violet-900",
    desc: "text-violet-700",
  },
  rose: {
    card: "bg-rose-50 border-rose-200 text-rose-900",
    icon: "bg-rose-100 text-rose-700",
    title: "text-rose-900",
    desc: "text-rose-700",
  },
  sky: {
    card: "bg-sky-50 border-sky-200 text-sky-900",
    icon: "bg-sky-100 text-sky-700",
    title: "text-sky-900",
    desc: "text-sky-700",
  },
  teal: {
    card: "bg-teal-50 border-teal-200 text-teal-900",
    icon: "bg-teal-100 text-teal-700",
    title: "text-teal-900",
    desc: "text-teal-700",
  },
  blue: {
    card: "bg-blue-50 border-blue-200 text-blue-900",
    icon: "bg-blue-100 text-blue-700",
    title: "text-blue-900",
    desc: "text-blue-700",
  },
  cyan: {
    card: "bg-cyan-50 border-cyan-200 text-cyan-900",
    icon: "bg-cyan-100 text-cyan-700",
    title: "text-cyan-900",
    desc: "text-cyan-700",
  },
  fuchsia: {
    card: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900",
    icon: "bg-fuchsia-100 text-fuchsia-700",
    title: "text-fuchsia-900",
    desc: "text-fuchsia-700",
  },
  lime: {
    card: "bg-lime-50 border-lime-200 text-lime-900",
    icon: "bg-lime-100 text-lime-700",
    title: "text-lime-900",
    desc: "text-lime-700",
  },
  orange: {
    card: "bg-orange-50 border-orange-200 text-orange-900",
    icon: "bg-orange-100 text-orange-700",
    title: "text-orange-900",
    desc: "text-orange-700",
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
  const [editTarget, setEditTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);
  const [deleteSelectedOpen, setDeleteSelectedOpen] = React.useState(false);
  const navigate = useNavigate();

  const refresh = () => setGroups(getGroups());
  const clearSelection = () => setSelectedIds([]);
  const allSelected = groups.length > 0 && selectedIds.length === groups.length;

  const addGroup = () => {
    const name = newName.trim();
    if (!name) {
      showError("Please enter a group name.");
      return;
    }
    const g = createGroup(name);
    setNewName("");
    refresh();
    clearSelection();
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedIds(groups.map((g) => g.id));
                  else clearSelection();
                }}
              />
              <span className="text-sm text-muted-foreground">Select All</span>
            </div>
            <span className="text-sm text-muted-foreground">
              Selected: {selectedIds.length}
            </span>
            {selectedIds.length > 0 && (
              <Button variant="ghost" size="sm" className="h-8" onClick={clearSelection}>
                Clear
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-9"
              disabled={selectedIds.length !== 1}
              onClick={() => {
                if (selectedIds.length === 1) {
                  const id = selectedIds[0];
                  const name = groups.find((g) => g.id === id)?.name || "";
                  setEditTarget({ id, name });
                }
              }}
              title="Edit selected group"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit Selected
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-9"
              disabled={selectedIds.length === 0}
              onClick={() => setDeleteSelectedOpen(true)}
              title="Delete selected groups"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        {groups.length === 0 ? (
          <p className="text-sm text-muted-foreground">No groups yet. Create one above.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {groups.map((g) => {
              const styles = colorMap[pickColor(g.id)];
              return (
                <Card
                  key={g.id}
                  className={cn(
                    "group overflow-hidden rounded-lg border p-3 md:p-4 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all",
                    styles.card
                  )}
                >
                  <CardHeader className="pb-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedIds.includes(g.id)}
                          onCheckedChange={(checked) =>
                            setSelectedIds((prev) =>
                              checked ? [...prev, g.id] : prev.filter((x) => x !== g.id)
                            )
                          }
                          aria-label={`Select ${g.name}`}
                        />
                        <CardTitle className={cn("text-base font-semibold", styles.title)}>{g.name}</CardTitle>
                      </div>
                      <span className={cn("p-1.5 rounded-lg", styles.icon)}>
                        <Users className="size-4" />
                      </span>
                    </div>
                    <CardDescription className={cn("text-xs", styles.desc)}>
                      {g.contacts.length} contacts • {g.sentHistory.length} sent
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-0 justify-end">
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="outline" className="h-8 px-2 text-xs" onClick={() => navigate(`/groups/${g.id}`)}>
                        Open
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {editTarget && (
        <EditGroupDialog
          groupId={editTarget.id}
          initialName={editTarget.name}
          open={true}
          onOpenChange={(open) => !open && setEditTarget(null)}
          onUpdated={() => {
            refresh();
            setEditTarget(null);
          }}
        />
      )}

      {deleteSelectedOpen && (
        <DeleteGroupsAlert
          groups={groups
            .filter((g) => selectedIds.includes(g.id))
            .map((g) => ({ id: g.id, name: g.name }))}
          open={deleteSelectedOpen}
          onOpenChange={setDeleteSelectedOpen}
          onDeleted={() => {
            refresh();
            clearSelection();
          }}
        />
      )}

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