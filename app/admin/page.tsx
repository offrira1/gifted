import { redirect } from "next/navigation";
import Link from "next/link";
import { getEventsByOwner } from "@/server/actions/events";
import { Button } from "@/components/ui/button";
import { CalendarComponent } from "@/app/admin/calendar-component";
import { Plus, Gift, BarChart3 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { isAdmin } from "@/lib/auth-admin";

export default async function AdminDashboardPage() {
  const admin = await isAdmin();
  if (!admin) redirect("/admin/login");

  const { data: events } = await getEventsByOwner();

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">לוח בקרה</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 me-2" />
            אירוע חדש
          </Link>
        </Button>
      </div>

      <CalendarComponent events={events ?? []} />

      <section>
        <h2 className="text-lg font-semibold mb-4">אירועים קרובים</h2>
        {events && events.length > 0 ? (
          <ul className="space-y-3">
            {events.slice(0, 10).map((ev) => (
              <li
                key={ev.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border p-4 bg-card"
              >
                <div>
                  <span className="font-medium">{ev.owner_display_name}</span>
                  <span className="text-muted-foreground text-sm me-2">
                    {" "}
                    – {formatDate(ev.event_date)}
                    {ev.location ? ` · ${ev.location}` : ""}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/e/${ev.id}`} target="_blank" rel="noopener">
                      כנס לאירוע
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/events/${ev.id}/stats`}>
                      <BarChart3 className="h-4 w-4 me-1" />
                      דוח תשלומים
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/g/${ev.id}`} target="_blank" rel="noopener">
                      <Gift className="h-4 w-4 me-1" />
                      זרימת אורח
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">אין עדיין אירועים. הוסף אירוע חדש.</p>
        )}
      </section>
    </div>
  );
}
