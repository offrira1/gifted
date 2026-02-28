"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import type { CreateEventInput } from "@/lib/validators/event";

function sanitize(str: string): string {
  return str.trim().slice(0, 2000);
}

export async function createEvent(input: CreateEventInput & { cover_media_url?: string }) {
  const supabase = await createClient();
  const admin = await isAdmin();
  const { data: { user } } = await supabase.auth.getUser();
  if (!admin && !user) return { error: "לא מחובר" };

  const eventDate = new Date(`${input.event_date}T${input.event_time}`);

  const { data, error } = await supabase
    .from("events")
    .insert({
      owner_user_id: admin ? null : user!.id,
      type: input.type,
      owner_display_name: sanitize(input.owner_display_name),
      owner_email: input.owner_email.trim().toLowerCase(),
      owner_phone: input.owner_phone.trim(),
      owner_address: input.owner_address ? sanitize(input.owner_address) : null,
      private_area_password: input.private_area_password ? sanitize(input.private_area_password) : null,
      bank_name: sanitize(input.bank_name),
      bank_branch: sanitize(input.bank_branch),
      bank_account_number: sanitize(input.bank_account_number),
      bank_beneficiary_name: sanitize(input.bank_beneficiary_name),
      bank_iban: input.bank_iban ? sanitize(input.bank_iban) : null,
      event_date: eventDate.toISOString(),
      location: input.location ? sanitize(input.location) : null,
      welcome_text: input.welcome_text ? sanitize(input.welcome_text) : null,
      cover_media_url: input.cover_media_url || null,
      bit_phone: input.bit_phone ? input.bit_phone.trim().replace(/\D/g, "").slice(0, 20) : null,
      paybox_phone: input.paybox_phone ? input.paybox_phone.trim().replace(/\D/g, "").slice(0, 20) : null,
      suggested_amounts: input.suggested_amounts
        ? input.suggested_amounts.split(",").map((n) => parseInt(n.trim(), 10)).filter((n) => !isNaN(n) && n >= 10).slice(0, 8)
        : [100, 200, 500, 1000],
      theme_color: input.theme_color?.trim() || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin");
  return { data: { id: data.id } };
}

export async function getEventsByOwner() {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (admin) {
    const { data, error } = await supabase
      .from("events")
      .select("id, type, owner_display_name, event_date, location")
      .order("event_date", { ascending: true });
    if (error) return { error: error.message, data: [] };
    return { data: data ?? [] };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [] as { id: string; type: string; owner_display_name: string; event_date: string; location: string | null }[] };

  const { data, error } = await supabase
    .from("events")
    .select("id, type, owner_display_name, event_date, location")
    .eq("owner_user_id", user.id)
    .order("event_date", { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function getEventsInRange(start: string, end: string) {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: [] };
  }
  let q = supabase
    .from("events")
    .select("id, type, owner_display_name, event_date, location")
    .gte("event_date", start)
    .lte("event_date", end)
    .order("event_date", { ascending: true });
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    q = q.eq("owner_user_id", user!.id);
  }
  const { data, error } = await q;
  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}

export async function updateEventCover(eventId: string, cover_media_url: string) {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "לא מחובר" };
  }
  let q = supabase
    .from("events")
    .update({ cover_media_url, updated_at: new Date().toISOString() })
    .eq("id", eventId);
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    q = q.eq("owner_user_id", user!.id);
  }
  const { error } = await q;

  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath(`/e/${eventId}`);
  return {};
}

export async function getEventById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("id, type, owner_display_name, owner_email, owner_phone, event_date, location, welcome_text, cover_media_url, bit_phone, paybox_phone, suggested_amounts, theme_color, created_at")
    .eq("id", id)
    .single();

  if (error || !data) return { error: "אירוע לא נמצא", data: null };
  return { data };
}

export async function getEventBankDetailsForGuest(eventId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("bank_name, bank_branch, bank_account_number, bank_beneficiary_name, bank_iban")
    .eq("id", eventId)
    .single();

  if (error || !data) return { error: "אירוע לא נמצא", data: null };
  return { data };
}

export async function getEventForOwner(id: string) {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (admin) {
    const { data, error } = await supabase.from("events").select("*").eq("id", id).single();
    if (error || !data) return { error: "אירוע לא נמצא", data: null };
    return { data };
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "לא מחובר", data: null };

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .eq("owner_user_id", user.id)
    .single();

  if (error || !data) return { error: "אירוע לא נמצא או שאין הרשאה", data: null };
  return { data };
}
