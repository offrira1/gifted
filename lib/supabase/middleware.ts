import { NextResponse, type NextRequest } from "next/server";
import { isAdminFromRequest } from "@/lib/auth-admin";

export async function updateSession(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (path.startsWith("/admin") && !path.startsWith("/admin/login")) {
    if (!(await isAdminFromRequest(request))) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next({ request });
}
