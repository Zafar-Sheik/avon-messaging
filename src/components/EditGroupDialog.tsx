"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { showError, showSuccess } from "@/utils/toast";
import { updateGroupName } from "@/utils/groupStore";

type Props = {
  groupId: string;
  initialName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: (newName: string) => void;
};

const EditGroupDialog: React.FC<Props> = ({ groupId, initialName, open, onOpenChange, onUpdated }) => {
  const [name, setName] = React.useState(initialName);

  React.useEffect(() => {
    setName(initialName);
  }, [initialName, open]);

  const handleSave = () => {
    const next = name.trim();
    if (!next) {
      showError("Group name cannot be empty.");
      return;
    }
    const updated = updateGroupName(groupId, next);
    if (!updated) {
      showError("Failed to update group name.");
      return;
    }
    showSuccess("Group name updated.");
    onUpdated(next);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription>Change the name of your group.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="edit-group-name">Group Name</Label>
          <Input
            id="edit-group-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a new group name"
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialog;