import { notFound } from "next/navigation";
import { getEventForOwner } from "@/server/actions/events";
import { getGiftsForEvent } from "@/server/actions/gifts";
import { StatsClient } from "./stats-client";
import { formatCurrency, formatDateTime } from "@/lib/utils";

const paymentMethodLabels: Record<string, string> = {
  bit: "BIT",
  paybox: "PayBox",
  paypal: "PayPal",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
  credit_card: "כרטיס אשראי",
  bank_transfer: "העברה בנקאית",
};

const statusLabels: Record<string, string> = {
  pending: "ממתין",
  completed: "הושלם",
  cancelled: "בוטל",
};

export default async function EventStatsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data: event, error: eventError } = await getEventForOwner(id);
  if (eventError || !event) notFound();

  const { data: gifts, error: giftsError } = await getGiftsForEvent(id);
  const rows = (gifts ?? []).map((g) => ({
    id: g.id,
    createdAt: formatDateTime(g.created_at),
    createdAtRaw: g.created_at,
    payerFirstName: g.payer_first_name,
    payerLastName: g.payer_last_name,
    giverDisplayName: g.giver_display_name,
    amount: g.amount,
    paymentMethod: paymentMethodLabels[g.payment_method] ?? g.payment_method,
    status: statusLabels[g.status] ?? g.status,
    blessingText: g.blessing_text,
    mediaUrl: g.media_url,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">דוח תשלומים – {event.owner_display_name}</h1>
      <StatsClient eventId={id} initialRows={rows} />
    </div>
  );
}
