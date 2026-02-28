"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from "date-fns";
import { he } from "date-fns/locale";
import { cn } from "@/lib/utils";

type EventItem = {
  id: string;
  type: string;
  owner_display_name: string;
  event_date: string;
  location: string | null;
};

export function CalendarComponent({ events }: { events: EventItem[] }) {
  const [month, setMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | undefined>(undefined);

  const eventsByDay = useMemo(() => {
    const map: Record<string, EventItem[]> = {};
    for (const ev of events) {
      const d = ev.event_date.slice(0, 10);
      if (!map[d]) map[d] = [];
      map[d].push(ev);
    }
    return map;
  }, [events]);

  const daysInMonth = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    return eachDayOfInterval({ start, end });
  }, [month]);

  const selectedDayEvents = selectedDay
    ? eventsByDay[format(selectedDay, "yyyy-MM-dd")] ?? []
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">לוח שנה</h2>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => subMonths(m, 1))}
            aria-label="חודש קודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="min-w-[140px] text-center font-medium">
            {format(month, "MMMM yyyy", { locale: he })}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            aria-label="חודש הבא"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-lg border bg-card p-4">
          <DayPicker
            mode="single"
            selected={selectedDay}
            onSelect={setSelectedDay}
            month={month}
            onMonthChange={setMonth}
            locale={he}
            dir="rtl"
            className="rdp-rtl"
            classNames={{
              months: "flex flex-col",
              month: "space-y-4",
              month_caption: "flex justify-center pt-1",
              nav: "flex gap-1",
              button_previous: "absolute start-1",
              button_next: "absolute end-1",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
              week: "flex w-full mt-2",
              day: "h-9 w-9 text-center text-sm p-0 relative",
              day_button: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-accent rounded-md",
              selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
              today: "bg-accent",
              outside: "text-muted-foreground opacity-50",
              hidden: "invisible",
            }}
          />
          <div className="flex justify-center mt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/events/new">
                <CalendarIcon className="h-4 w-4 me-2" />
                הוסף אירוע ליום
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium mb-3">
            {selectedDay
              ? `אירועים ב־${selectedDay ? format(selectedDay, "d.M.yyyy", { locale: he }) : ""}`
              : "בחר תאריך"}
          </h3>
          {selectedDay && selectedDayEvents.length > 0 ? (
            <ul className="space-y-2">
              {selectedDayEvents.map((ev) => (
                <li key={ev.id} className="flex items-center justify-between gap-2 text-sm">
                  <span>{ev.owner_display_name}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/e/${ev.id}`} target="_blank" rel="noopener">
                        כנס
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin/events/${ev.id}/stats`}>דוח</Link>
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : selectedDay ? (
            <p className="text-muted-foreground text-sm">אין אירועים ביום זה</p>
          ) : (
            <p className="text-muted-foreground text-sm">בחר תאריך כדי לראות אירועים</p>
          )}
        </div>
      </div>
    </div>
  );
}
