import { getGroups } from "@/utils/groupStore";

export type Stats = {
  groupCount: number;
  contactCount: number;
  sentCount: number;
  pendingCount: number;
};

export const getWhatsAppStats = (): Stats => {
  const groups = getGroups();
  const groupCount = groups.length;
  const contactCount = groups.reduce((sum, g) => sum + g.contacts.length, 0);
  const sentCount = groups.reduce((sum, g) => sum + g.sentHistory.length, 0);
  const pendingCount = contactCount;
  return { groupCount, contactCount, sentCount, pendingCount };
};