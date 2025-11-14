"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { showSuccess } from "@/utils/toast";
import { deleteGroup } from "@/utils/groupStore";

type Deletable = { id: string; name: string };

type Props = {
  groups: Deletable[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

const DeleteGroupsAlert: React.FC<Props> = ({ groups, open, onOpenChange, onDeleted }) => {
  const count = groups.length;

  const handleDelete = () => {
    groups.forEach((g) => deleteGroup(g.id));
    showSuccess(`Deleted ${count} ${count === 1 ? "group" : "groups"}.`);
    onDeleted();
    onOpenChange(false);
  };

  const names = groups.map((g) => g.name).join(", ");

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Selected {count === 1 ? "Group" : "Groups"}</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the selected {count === 1 ? "group" : "groups"} and their local contacts/history. This cannot be undone.
          </AlertDialogDescription>
          {count > 0 && (
            <div className="mt-2 text-sm text-muted-foreground break-words">
              {names}
            </div>
          )}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupsAlert;