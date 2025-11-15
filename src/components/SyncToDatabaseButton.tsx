"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Database } from "lucide-react";
import {
  showError,
  showSuccess,
  showLoading,
  dismissToast,
} from "@/utils/toast";
import { syncAvonGroups } from "@/utils/dbSync";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const SyncToDatabaseButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();

  const handleSync = async () => {
    if (loading) return;
    setLoading(true);
    const toastId = showLoading("Syncing to database...");

    try {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) {
        dismissToast(toastId.toString());
        showError("Please sign in to sync. Redirecting to login...");
        navigate("/login");
        setLoading(false);
        return;
      }

      const result = await syncAvonGroups();
      dismissToast(toastId.toString());
      showSuccess(
        `Synced: ${result.groupsCreated} new group(s), ${result.contactsInserted} contact(s).`
      );
    } catch (err: any) {
      dismissToast(toastId.toString());
      showError(err?.message || "Failed to sync data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleSync} disabled={loading}>
      <Database className="mr-2 h-4 w-4" />
      {loading ? "Syncing..." : "Sync to Database"}
    </Button>
  );
};

export default SyncToDatabaseButton;
