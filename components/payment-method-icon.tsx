"use client";

import { cn } from "@/lib/utils";

/** אייקונים רשמיים/מותג – BIT ו-PayBox כ-SVG מקומי, השאר מ-CDN */
const ICON_SOURCES: Record<string, string> = {
  bit: "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#00A651"/><text x="20" y="26" font-family="Arial,sans-serif" font-size="14" font-weight="bold" fill="white" text-anchor="middle">BIT</text></svg>'
  ),
  paybox: "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" rx="8" fill="#1E3A5F"/><text x="20" y="26" font-family="Arial,sans-serif" font-size="10" font-weight="bold" fill="white" text-anchor="middle">PayBox</text></svg>'
  ),
  paypal: "https://cdn.simpleicons.org/paypal/00457C",
  google_pay: "https://cdn.simpleicons.org/googlepay/5F6368",
  apple_pay: "https://cdn.simpleicons.org/applepay/000000",
  credit_card: "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'
  ),
  bank_transfer: "data:image/svg+xml," + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><path d="M6 14h2"/><path d="M10 14h4"/></svg>'
  ),
};

interface PaymentMethodIconProps {
  id: string;
  iconUrl: string;
  className?: string;
}

export function PaymentMethodIcon({ id, iconUrl, className }: PaymentMethodIconProps) {
  const src = ICON_SOURCES[id] || iconUrl;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-xl shrink-0 overflow-hidden bg-white border border-border shadow-sm",
        className
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- external/data URLs, fixed size icons */}
      <img src={src} alt="" className="w-full h-full object-contain p-1" />
    </span>
  );
}
