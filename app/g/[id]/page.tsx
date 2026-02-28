import { notFound } from "next/navigation";
import { getEventById } from "@/server/actions/events";
import { GuestFlowWrapper } from "./guest-flow-wrapper";

export default async function GuestFlowPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: event, error } = await getEventById(id);
  if (error || !event) notFound();

  const suggestedAmounts = Array.isArray(event.suggested_amounts) && event.suggested_amounts.length > 0
    ? event.suggested_amounts
    : [100, 200, 500, 1000];

  return (
    <GuestFlowWrapper
      eventId={event.id}
      eventTitle={event.owner_display_name}
      ownerDisplayName={event.owner_display_name}
      suggestedAmounts={suggestedAmounts}
      themeColor={event.theme_color ?? undefined}
      bitPhone={event.bit_phone ?? undefined}
      payboxPhone={event.paybox_phone ?? undefined}
      bitMeId={event.bit_me_id ?? undefined}
    />
  );
}
