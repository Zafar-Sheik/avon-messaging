export const REPLY_NOW_PHONE = "+1234567890"; // Set this to your WhatsApp number

export const normalizeReplyPhone = (phone: string): string => (phone || "").replace(/\D+/g, "");

export const getReplyNowLink = (): string | null => {
  const p = normalizeReplyPhone(REPLY_NOW_PHONE);
  return p ? `https://wa.me/${p}` : null;
};