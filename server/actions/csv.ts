"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-admin";

const BOM = "\uFEFF";

export async function exportGiftsCSV(eventId: string): Promise<string | null> {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data: event } = await supabase
      .from("events")
      .select("owner_user_id")
      .eq("id", eventId)
      .single();
    if (!event || event.owner_user_id !== user.id) return null;
  }

  const { data: gifts, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error || !gifts) return null;

  const headers = [
    "תאריך",
    "שם פרטי (משלם)",
    "שם משפחה (משלם)",
    "נותן מתנה",
    "סכום",
    "אמצעי תשלום",
    "סטטוס",
    "ברכה",
    "קובץ מצורף",
  ];

  const escape = (s: string | null | undefined) => {
    if (s == null) return "";
    const t = String(s);
    if (/[",\n\r]/.test(t)) return `"${t.replace(/"/g, '""')}"`;
    return t;
  };

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleString("he-IL");
    } catch {
      return d;
    }
  };

  const rows = gifts.map((g) => [
    formatDate(g.created_at),
    g.payer_first_name,
    g.payer_last_name,
    g.giver_display_name,
    g.amount,
    g.payment_method,
    g.status,
    g.blessing_text ?? "",
    g.media_url ?? "",
  ].map(escape));

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
  return BOM + csv;
}
