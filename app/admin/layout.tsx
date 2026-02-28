import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "@/server/actions/auth";
import { isAdmin } from "@/lib/auth-admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await isAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {admin ? (
        <>
          <header className="border-b bg-card">
            <div className="container flex items-center justify-between h-14 px-4">
              <Link href="/admin" className="font-semibold">
                Gifted – מנהל
              </Link>
              <form action={signOut}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="h-4 w-4 me-2" />
                  התנתק
                </Button>
              </form>
            </div>
          </header>
          <main className="flex-1 container py-6 px-4">{children}</main>
        </>
      ) : (
        <main className="flex-1">{children}</main>
      )}
    </div>
  );
}
