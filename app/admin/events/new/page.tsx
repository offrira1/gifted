import { redirect } from "next/navigation";
import { EventForm } from "./event-form";
import { isAdmin } from "@/lib/auth-admin";

export default async function NewEventPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/admin/login");

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">הוספת אירוע חדש</h1>
      <EventForm />
    </div>
  );
}
