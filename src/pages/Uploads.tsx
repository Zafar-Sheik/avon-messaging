"use client";

import React from "react";
import ContactImport from "@/components/ContactImport";
import FileManager from "@/components/FileManager";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { getGroups, addContactsToGroup } from "@/utils/groupStore";
import { showError, showSuccess } from "@/utils/toast";
import { Upload, Users } from "lucide-react";

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
      showSuccess(
        `Imported ${contacts.length} contact(s) into "${updated.name}".`
      );
    } else {
      showError("Failed to import contacts.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-full mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Upload className="h-6 w-6 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold">Uploads</h1>
            <p className="text-muted-foreground">
              Import contacts and manage files for your WhatsApp campaigns
            </p>
          </div>
        </div>

        {/* Contact Import Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Contact Import</h2>
            </div>

            <div className="space-y-3">
              <Label>Select Group for Import</Label>
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="w-full sm:w-80">
                  <SelectValue placeholder="Choose a group" />
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
              <p className="text-sm text-muted-foreground">
                Choose which group to import contacts into. Create groups from
                the Groups page if needed.
              </p>
            </div>

            {groupId && (
              <div className="pt-4 border-t">
                <ContactImport onImported={onImported} />
              </div>
            )}
          </div>
        </Card>

        {/* File Manager Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">File Management</h2>
          </div>
          <FileManager />
        </div>
      </div>
    </div>
  );
};

export default UploadsPage;
