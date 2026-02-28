import { GuestFlowWrapper } from "@/app/g/[id]/guest-flow-wrapper";

/**
 * דף תצוגה מקדימה – איך אורח רואה את דף התשלום.
 * מגיעים לכאן מ: דף הבית → "צפה בדף תשלום" או ישירות ל־/demo/guest
 */
export default function DemoGuestPage() {
  return (
    <GuestFlowWrapper
      eventId="demo"
      eventTitle="יוסי ומרים"
      ownerDisplayName="יוסי ומרים"
      suggestedAmounts={[100, 200, 500, 1000]}
      themeColor="#c41e5a"
      bitPhone="0501234567"
      payboxPhone="0501234567"
      bitMeId="E6C44E6B-21EB-0CCA-A6D1-682AD169956A77A1"
      preview
    />
  );
}
