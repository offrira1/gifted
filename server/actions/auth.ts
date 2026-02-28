"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import {
  checkAdminCredentials,
  getAdminCookieValue,
  getAdminCookieName,
} from "@/lib/auth-admin";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 1 week
};

export async function login(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "נא למלא משתמש וסיסמה" };
  }

  if (!checkAdminCredentials(username, password)) {
    return { error: "משתמש או סיסמה שגויים" };
  }

  const cookieStore = await cookies();
  cookieStore.set(getAdminCookieName(), await getAdminCookieValue(), COOKIE_OPTIONS);

  revalidatePath("/", "layout");
  redirect("/admin");
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(getAdminCookieName());
  revalidatePath("/", "layout");
  redirect("/");
}
