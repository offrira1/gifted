import type { PaymentMethod } from "@/lib/validators/gift";

export interface PaymentMethodConfig {
  id: PaymentMethod;
  label: string;
  /** Official/brand icon URL (for img src) */
  iconUrl: string;
  /** Try to open app; fallback to webUrl then store */
  appScheme?: string;
  webUrl: string;
  androidPackage?: string;
  iosStoreId?: string;
}

/**
 * BIT – לינק לאפליקציה / לאתר.
 * חברות (חשבונית ירוקה, Hyp וכו') משתמשות ב-Grow (Meshulam) – יוצרות לינק תשלום חד-פעמי דרך API.
 * אנחנו מנסים intent/URL עם פרמטרים (phone, amount); אם ביט תומכת – ייפתח מסך השליחה עם השדות מוכנים.
 * אופציונלי: אינטגרציה עם Grow לבעלי אירוע שהם סולקים – createPaymentProcess → לינק שפותח את ביט עם הסכום.
 */
const BIT_APP = "https://www.bitpay.co.il/app";
const BIT_ANDROID = "https://play.google.com/store/apps/details?id=com.bnhp.payments.paymentsapp";
const BIT_IOS = "https://apps.apple.com/app/bit-%D7%91%D7%99%D7%98/id1499126562";

/**
 * PayBox – אתר וחנות אפליקציות
 */
const PAYBOX_WEB = "https://payboxapp.com";
const PAYBOX_ANDROID = "https://play.google.com/store/apps/details?id=com.payboxapp";
const PAYBOX_IOS = "https://apps.apple.com/app/paybox/id1466123952";

/**
 * PayPal – כניסה / תשלום
 */
const PAYPAL_WEB = "https://www.paypal.com";
const PAYPAL_APP = "https://www.paypal.com/paypalme/";

/**
 * Google Pay – מידע / כניסה
 */
const GOOGLE_PAY_WEB = "https://pay.google.com";

/**
 * Apple Pay – מידע / כניסה
 */
const APPLE_PAY_WEB = "https://www.apple.com/apple-pay/";

export const PAYMENT_METHODS_CONFIG: PaymentMethodConfig[] = [
  {
    id: "bit",
    label: "BIT",
    iconUrl: "https://cdn.jsdelivr.net/gh/simple-icons/simple-icons@v9/icons/bit.svg",
    webUrl: BIT_APP,
    androidPackage: "com.bnhp.payments.paymentsapp",
    iosStoreId: "1499126562",
  },
  {
    id: "google_pay",
    label: "Google Pay",
    iconUrl: "https://cdn.simpleicons.org/googlepay/5F6368",
    webUrl: GOOGLE_PAY_WEB,
  },
  {
    id: "apple_pay",
    label: "Apple Pay",
    iconUrl: "https://cdn.simpleicons.org/applepay/000000",
    webUrl: APPLE_PAY_WEB,
  },
  {
    id: "credit_card",
    label: "כרטיס אשראי",
    iconUrl: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>'),
    webUrl: "#",
  },
  {
    id: "paybox",
    label: "PayBox",
    iconUrl: "https://payboxapp.com/favicon.ico",
    webUrl: PAYBOX_WEB,
    androidPackage: "com.payboxapp",
    iosStoreId: "1466123952",
  },
  {
    id: "paypal",
    label: "PayPal",
    iconUrl: "https://cdn.simpleicons.org/paypal/00457C",
    webUrl: PAYPAL_WEB,
  },
  {
    id: "bank_transfer",
    label: "העברה בנקאית",
    iconUrl: "data:image/svg+xml," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 10h20"/><path d="M6 14h2"/><path d="M10 14h4"/></svg>'),
    webUrl: "#",
  },
];

/** Open app or fallback to web/store (mobile-friendly) */
export function getOpenAppUrl(config: PaymentMethodConfig): string {
  if (config.id === "bank_transfer") return "#";
  return config.webUrl;
}

const BIT_ME_BASE = "https://www.bitpay.co.il/app/me";
const BIT_FALLBACK = "https://www.bitpay.co.il/app";
const PAYBOX_FALLBACK = "https://payboxapp.com";

/** BIT "me" link – פתיחת עמוד התשלום למקבל. פותחים בנייד → ביט נפתח ישירות. בלי amount (ביט לא תומכת). */
export function getBitMePaymentUrl(bitMeId: string): string {
  return `${BIT_ME_BASE}/${encodeURIComponent(bitMeId.trim())}`;
}

/** Android: open BIT app; optional phone & amount in path/query if app supports it */
export function getBitIntentUrl(phone?: string, amount?: number): string {
  const fallback = encodeURIComponent(BIT_FALLBACK);
  let path = "pay";
  if (phone || (amount != null && amount > 0)) {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone.replace(/\D/g, ""));
    if (amount != null && amount > 0) params.set("amount", String(amount));
    path += "?" + params.toString();
  }
  return `intent://${path}#Intent;scheme=bit;package=com.bnhp.payments.paymentsapp;S.browser_fallback_url=${fallback};end`;
}

/** iOS / web: try poalimlinks page with params (may open BIT via universal link) */
export function getBitPaymentPageUrl(phone?: string, amount?: number): string {
  const base = "https://bitpay.poalimlinks.co.il/app";
  if (!phone && (amount == null || amount <= 0)) return base;
  const params = new URLSearchParams();
  if (phone) params.set("phone", phone.replace(/\D/g, ""));
  if (amount != null && amount > 0) params.set("amount", String(amount));
  return `${base}?${params.toString()}`;
}

export function getPayBoxIntentUrl(phone?: string, amount?: number): string {
  const fallback = encodeURIComponent(PAYBOX_FALLBACK);
  let path = "open";
  if (phone || (amount != null && amount > 0)) {
    const params = new URLSearchParams();
    if (phone) params.set("phone", phone.replace(/\D/g, ""));
    if (amount != null && amount > 0) params.set("amount", String(amount));
    path += "?" + params.toString();
  }
  return `intent://${path}#Intent;scheme=paybox;package=com.payboxapp;S.browser_fallback_url=${fallback};end`;
}
