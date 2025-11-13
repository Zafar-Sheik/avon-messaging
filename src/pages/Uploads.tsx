"use client";

import React from "react";
import ContactImport from "@/components/ContactImport";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { getGroups, addContactsToGroup } from "@/utils/groupStore";
import { showError, showSuccess } from "@/utils/toast";

const UploadsPage = () => {
  const [groupId, setGroupId] = React.useState<string>("");
  const groups = getGroups();

  const onImported = (contacts: Array<{ name: string; phone: string }>) => {
    if (!groupId) {
      showError("Please select a group first.");
      return;
    }
    const updated = addContactsToGroup(groupId, contacts);
    if (updated) {
      showSuccess(`Imported ${contacts.length} contact(s) into "${updated.name}".`);
    } else {
      showError("Failed to import contacts.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Files Uploads</h1>
        <Card className="p-4 space-y-3">
          <div className="space-y-1">
            <Label>Select Group</Label>
            <Select value={groupId} onValueChange={setGroupId}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Choose a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.length === 0 ? (
                  <SelectItem value="__none" disabled>No groups found</SelectItem>
                ) : (
                  groups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4">
          <ContactImport onImported={onImported} />
        </Card>
      </div>
    </div>
  );
};

export default UploadsPage;