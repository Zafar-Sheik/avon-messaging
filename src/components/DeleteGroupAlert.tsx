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
import { showSuccess, showError } from "@/utils/toast";
import { deleteGroup } from "@/utils/groupStore";

type Props = {
  groupId: string;
  groupName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDeleted: () => void;
};

const DeleteGroupAlert: React.FC<Props> = ({ groupId, groupName, open, onOpenChange, onDeleted }) => {
  const handleDelete = () => {
    try {
      deleteGroup(groupId);
      showSuccess(`Deleted group "${groupName}".`);
      onDeleted();
      onOpenChange(false);
    } catch {
      showError("Failed to delete group.");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Group</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove the group and its local contacts/history. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteGroupAlert;