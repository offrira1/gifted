import { notFound } from "next/navigation";
import { getEventById } from "@/server/actions/events";
import { EventPublicPage } from "./event-public-page";
import { formatDate } from "@/lib/utils";

const eventTypeLabels: Record<string, string> = {
  wedding: "חתונה",
  bar_mitzvah: "בר מצווה",
  bat_mitzvah: "בת מצווה",
  private: "אירוע פרטי",
  other: "אירוע",
};

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: event, error } = await getEventById(id);
  if (error || !event) notFound();

  const typeLabel = eventTypeLabels[event.type] || event.type;
  const title = `ברוכים הבאים ל${typeLabel} של ${event.owner_display_name} בתאריך ${formatDate(event.event_date)}`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gifted.example.com";
  const giftUrl = `${baseUrl}/g/${event.id}`;

  return (
    <EventPublicPage
      eventId={event.id}
      giftUrl={giftUrl}
      title={title}
      welcomeText={event.welcome_text}
      coverMediaUrl={event.cover_media_url}
      themeColor={event.theme_color ?? undefined}
    />
  );
}
