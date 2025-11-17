"use client";

import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { getGroups, createGroup } from "@/utils/groupStore";
import GroupDetailDialog from "@/components/GroupDetailDialog";
import { showError, showSuccess } from "@/utils/toast";
import { Plus, Users, MessageSquare, Calendar, ArrowRight } from "lucide-react";

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
    if (!g) {
      showError("A group with this name already exists.");
      return;
    }
    setNewName("");
    refresh();
    showSuccess(`Created group "${g.name}".`);
  };

  return (
    <div className="max-w-full mx-auto w-full p-6 space-y-8">
      {/* Header Section */}
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Group Management
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          Create and manage contact groups for your WhatsApp campaigns
        </p>
      </div>

      {/* Create Group Card */}
      <Card className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Users className="size-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Create New Group
            </h2>
            <p className="text-gray-600 text-sm">
              Add a new group to organize your contacts
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Group Name
            </label>
            <Input
              placeholder="Enter group name (e.g., VIP Customers, Newsletter Subscribers)"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full"
              onKeyPress={(e) => e.key === "Enter" && addGroup()}
            />
          </div>
          <Button
            onClick={addGroup}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 min-w-[140px]">
            <Plus className="size-4" />
            <span>Create Group</span>
          </Button>
        </div>
      </Card>

      {/* Groups Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Your Groups</h2>
            <p className="text-gray-600 text-sm">
              {groups.length} group{groups.length !== 1 ? "s" : ""} created
            </p>
          </div>
          {groups.length > 0 && (
            <Button
              variant="outline"
              onClick={refresh}
              className="text-gray-600">
              Refresh
            </Button>
          )}
        </div>

        {groups.length === 0 ? (
          <Card className="p-12 text-center bg-gray-50 border border-gray-200 rounded-xl">
            <Users className="size-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No groups yet
            </h3>
            <p className="text-gray-600 mb-4 max-w-md mx-auto">
              Create your first group to start organizing contacts and sending
              WhatsApp messages.
            </p>
            <Button
              onClick={addGroup}
              className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="size-4 mr-2" />
              Create Your First Group
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {groups.map((g) => (
              <Card
                key={g.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 group cursor-pointer"
                onClick={() => setActiveGroupId(g.id)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                        {g.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600 mt-1">
                        Created {new Date(g.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Users className="size-4 text-blue-600" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pb-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="size-4" />
                        <span>Total Contacts</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {g.contacts.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageSquare className="size-4" />
                        <span>Messages Sent</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {g.sentHistory.length}
                      </span>
                    </div>

                    {g.lastSent && (
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="size-4" />
                          <span>Last Message</span>
                        </div>
                        <span className="text-gray-900 text-xs">
                          {new Date(g.lastSent).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    variant="outline"
                    className="w-full group-hover:border-blue-200 group-hover:text-blue-600 transition-colors flex items-center justify-between"
                    onClick={() => setActiveGroupId(g.id)}>
                    <span>Manage Group</span>
                    <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Group Detail Dialog */}
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