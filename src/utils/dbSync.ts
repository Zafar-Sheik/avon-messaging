"use client";

import { supabase } from "@/integrations/supabase/client";
import { getGroups } from "@/utils/groupStore";

export type SyncResult = {
  groupsProcessed: number;
  groupsCreated: number;
  contactsInserted: number;
};

export const syncAvonGroups = async (): Promise<SyncResult> => {
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;
  if (!user) {
    throw new Error("Please sign in to sync data.");
  }

  const groups = getGroups();
  let groupsCreated = 0;
  let contactsInserted = 0;

  for (const g of groups) {
    // Find existing group by name for this user
    const { data: existingGroup, error: existingGroupErr } = await supabase
      .from("avon_work_groups")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", g.name)
      .limit(1)
      .maybeSingle();

    if (existingGroupErr) {
      throw new Error(existingGroupErr.message);
    }

    let groupId = existingGroup?.id as string | undefined;

    // Create group if not present
    if (!groupId) {
      const { data: inserted, error: insertErr } = await supabase
        .from("avon_work_groups")
        .insert({
          user_id: user.id,
          name: g.name,
          description: null,
        })
        .select("id")
        .single();

      if (insertErr) {
        throw new Error(insertErr.message);
      }
      groupId = inserted.id as string;
      groupsCreated += 1;
    }

    // Fetch existing contacts to avoid duplicates by phone_number within the group
    const { data: existingContacts, error: contactsErr } = await supabase
      .from("avon_work_contacts")
      .select("phone_number")
      .eq("user_id", user.id)
      .eq("avon_work_group_id", groupId);

    if (contactsErr) {
      throw new Error(contactsErr.message);
    }

    const existingPhoneSet = new Set((existingContacts || []).map((c: any) => String(c.phone_number)));

    // Prepare new contacts to insert
    const toInsert = g.contacts
      .filter((c) => {
        const phone = String(c.phone || "").replace(/\D+/g, "");
        return phone.length > 0 && !existingPhoneSet.has(phone);
      })
      .map((c) => ({
        user_id: user.id,
        avon_work_group_id: groupId,
        name: c.name || "",
        surname: null,
        phone_number: String(c.phone || "").replace(/\D+/g, ""),
        email: null,
        company: null,
        subscription_status: "subscribed",
      }));

    if (toInsert.length > 0) {
      const { error: insertContactsErr } = await supabase
        .from("avon_work_contacts")
        .insert(toInsert);

      if (insertContactsErr) {
        throw new Error(insertContactsErr.message);
      }
      contactsInserted += toInsert.length;
    }
  }

  return {
    groupsProcessed: groups.length,
    groupsCreated,
    contactsInserted,
  };
};