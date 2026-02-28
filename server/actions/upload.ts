"use server";

import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/auth-admin";

const BUCKET = "event-media";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function uploadEventCover(eventId: string, file: File): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_SIZE) return { error: "גודל הקובץ מקסימום 10MB" };
  const supabase = await createClient();
  const admin = await isAdmin();
  let path: string;
  const ext = file.name.split(".").pop() || "bin";
  if (admin) {
    path = `admin/${eventId}/cover.${ext}`;
  } else {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "לא מחובר" };
    path = `${user.id}/${eventId}/cover.${ext}`;
  }

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl };
}

export async function uploadGiftMedia(eventId: string, file: File, suffix?: string): Promise<{ url?: string; error?: string }> {
  if (file.size > MAX_SIZE) return { error: "גודל הקובץ מקסימום 10MB" };
  const supabase = await createClient();

  const ext = file.name.split(".").pop() || "bin";
  const path = `guest/${eventId}/${suffix ?? Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type,
  });

  if (error) return { error: error.message };

  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: urlData.publicUrl };
}
