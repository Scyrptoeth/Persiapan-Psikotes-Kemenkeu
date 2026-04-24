import { normalizePhone } from "@/lib/format";

const AUTH_EMAIL_DOMAIN = "psikotes-kemenkeu.local";

export function phoneToAuthEmail(rawPhone: string): string {
  const normalized = normalizePhone(rawPhone);
  const digits = normalized.replace(/\D/g, "");

  if (!digits) {
    throw new Error("Nomor WhatsApp tidak valid.");
  }

  return `wa-${digits}@${AUTH_EMAIL_DOMAIN}`;
}

