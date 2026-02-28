import { cookies } from "next/headers";
import { type NextRequest } from "next/server";

const COOKIE_NAME = "gifted_admin";
const PAYLOAD = "1";

function getSecret(): string {
  const s = process.env.GIFTED_ADMIN_SECRET;
  if (!s?.trim()) return "gifted-default-secret-change-in-production";
  return s.trim();
}

/** Web Crypto API – works in Edge Runtime (middleware) and Node */
async function sign(payload: string): Promise<string> {
  const secret = getSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload)
  );
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function verify(value: string): Promise<boolean> {
  const parts = value.split(".");
  if (parts.length !== 2 || parts[0] !== PAYLOAD) return false;
  const expected = await sign(PAYLOAD);
  return timingSafeEqual(parts[1], expected);
}

export function getAdminCredentials(): { username: string; password: string } {
  return {
    username: process.env.ADMIN_USERNAME?.trim() || "admin",
    password: process.env.ADMIN_PASSWORD?.trim() || "admin",
  };
}

export function checkAdminCredentials(username: string, password: string): boolean {
  const { username: u, password: p } = getAdminCredentials();
  return username === u && password === p;
}

/** Use in middleware: pass request to read cookie */
export async function isAdminFromRequest(request: NextRequest): Promise<boolean> {
  const value = request.cookies.get(COOKIE_NAME)?.value;
  return !!value && (await verify(value));
}

/** Use in server components/actions: reads cookies() */
export async function isAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  return !!value && (await verify(value));
}

export async function getAdminCookieValue(): Promise<string> {
  const sig = await sign(PAYLOAD);
  return `${PAYLOAD}.${sig}`;
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}
