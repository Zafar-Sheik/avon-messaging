"use client";

import { supabase } from "@/integrations/supabase/client";
import { getGroups } from "@/utils/groupStore";

export type SyncResult = {
  groupsProcessed: number;
  groupsCreated: number;
  contactsInserted: number;
  contactsLinked: number; // New count for contacts linked to groups
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
  let contactsLinked = 0;

  for (const g of groups) {
    // Find existing group by name for this user in public.avon_work_groups
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

    let avonWorkGroupId = existingGroup?.id as string | undefined;

    // Create group in public.avon_work_groups if not present
    if (!avonWorkGroupId) {
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
      avonWorkGroupId = inserted.id as string;
      groupsCreated += 1;
    }

    // Process contacts for the current group
    for (const localContact of g.contacts) {
      const normalizedPhone = String(localContact.phone || "").replace(/\D+/g, "");
      if (!normalizedPhone) continue;

      // 1. Find or create the contact in public.contacts
      let contactId: string | undefined;
      const { data: existingContact, error: existingContactErr } = await supabase
        .from("contacts")
        .select("id")
        .eq("user_id", user.id)
        .eq("phone_number", normalizedPhone)
        .limit(1)
        .maybeSingle();

      if (existingContactErr) {
        throw new Error(existingContactErr.message);
      }

      if (existingContact) {
        contactId = existingContact.id as string;
      } else {
        const { data: newContact, error: newContactErr } = await supabase
          .from("contacts")
          .insert({
            user_id: user.id,
            name: localContact.name || "",
            phone_number: normalizedPhone,
            email: null,
            surname: null,
            company: null,
            headoffice_account_id: null,
            subscription_status: "subscribed",
          })
          .select("id")
          .single();

        if (newContactErr) {
          throw new Error(newContactErr.message);
        }
        contactId = newContact.id as string;
        contactsInserted += 1;
      }

      // 2. Link the contact to the avon_work_group in public.avon_work_group_members
      if (contactId && avonWorkGroupId) {
        const { data: existingGroupMember, error: existingGroupMemberErr } = await supabase
          .from("avon_work_group_members")
          .select("id")
          .eq("user_id", user.id)
          .eq("avon_work_group_id", avonWorkGroupId)
          .eq("contact_id", contactId)
          .limit(1)
          .maybeSingle();

        if (existingGroupMemberErr) {
          throw new Error(existingGroupMemberErr.message);
        }

        if (!existingGroupMember) {
          const { error: insertGroupMemberErr } = await supabase
            .from("avon_work_group_members")
            .insert({
              user_id: user.id,
              avon_work_group_id: avonWorkGroupId,
              contact_id: contactId,
            });

          if (insertGroupMemberErr) {
            throw new Error(insertGroupMemberErr.message);
          }
          contactsLinked += 1;
        }
      }
    }
  }

  return {
    groupsProcessed: groups.length,
    groupsCreated,
    contactsInserted,
    contactsLinked,
  };
};