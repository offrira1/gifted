"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth-admin";
import type { GiftStep1Input, PaymentMethod } from "@/lib/validators/gift";

function sanitize(str: string): string {
  return str.trim().slice(0, 2000);
}

export async function createGift(
  eventId: string,
  step1: GiftStep1Input,
  paymentMethod: PaymentMethod,
  mediaUrl?: string
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("gifts")
    .insert({
      event_id: eventId,
      giver_display_name: sanitize(step1.giver_display_name),
      blessing_text: step1.blessing_text ? sanitize(step1.blessing_text) : null,
      payer_first_name: sanitize(step1.payer_first_name),
      payer_last_name: sanitize(step1.payer_last_name),
      amount: step1.amount,
      payment_method: paymentMethod,
      status: "pending",
      media_url: mediaUrl || null,
    })
    .select("id, status, created_at")
    .single();

  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${eventId}/stats`);
  return { data: { id: data.id, status: data.status, created_at: data.created_at } };
}

export async function setGiftCompleted(giftId: string) {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "לא מחובר" };
  }

  const { data: gift } = await supabase
    .from("gifts")
    .select("event_id")
    .eq("id", giftId)
    .single();

  if (!gift) return { error: "מתנה לא נמצאה" };

  if (!admin) {
    const { data: event } = await supabase
      .from("events")
      .select("owner_user_id")
      .eq("id", gift.event_id)
      .single();
    const { data: { user } } = await supabase.auth.getUser();
    if (!event || event.owner_user_id !== user?.id) return { error: "אין הרשאה" };
  }

  const { error } = await supabase
    .from("gifts")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", giftId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/events/${gift.event_id}/stats`);
  return {};
}

export async function getGiftsForEvent(eventId: string) {
  const supabase = await createClient();
  const admin = await isAdmin();
  if (!admin) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "לא מחובר", data: [] };
    const { data: event } = await supabase
      .from("events")
      .select("owner_user_id")
      .eq("id", eventId)
      .single();
    if (!event || event.owner_user_id !== user.id) return { error: "אין הרשאה", data: [] };
  }

  const { data, error } = await supabase
    .from("gifts")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data ?? [] };
}
