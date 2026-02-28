"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { giftStep1Schema, type GiftStep1Input, type PaymentMethod } from "@/lib/validators/gift";
import { createGift } from "@/server/actions/gifts";
import { uploadGiftMedia } from "@/server/actions/upload";
import { getEventBankDetailsForGuest } from "@/server/actions/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, Heart, ArrowRight, Loader2, ExternalLink } from "lucide-react";
import {
  PAYMENT_METHODS_CONFIG,
  getOpenAppUrl,
  getBitIntentUrl,
  getPayBoxIntentUrl,
} from "@/lib/payment-methods";
import { PaymentMethodIcon } from "@/components/payment-method-icon";

interface GuestFlowWrapperProps {
  eventId: string;
  eventTitle: string;
  ownerDisplayName: string;
  suggestedAmounts?: number[];
  themeColor?: string;
  bitPhone?: string;
  payboxPhone?: string;
  /** תצוגה מקדימה – לא שומר מתנה במערכת, מציג הוראות עם נתוני דמה */
  preview?: boolean;
}

const PAYMENT_LABELS: Record<string, string> = {
  bit: "BIT",
  paybox: "PayBox",
  paypal: "PayPal",
  google_pay: "Google Pay",
  apple_pay: "Apple Pay",
  credit_card: "כרטיס אשראי",
  bank_transfer: "העברה בנקאית",
};

const DEFAULT_AMOUNTS = [100, 200, 500, 1000];

const DEMO_BANK = {
  bank_name: "בנק הדוגמה",
  bank_branch: "100",
  bank_account_number: "123456",
  bank_beneficiary_name: "יוסי ומרים",
  bank_iban: null as string | null,
};

export function GuestFlowWrapper({
  eventId,
  eventTitle,
  ownerDisplayName,
  suggestedAmounts = DEFAULT_AMOUNTS,
  themeColor,
  bitPhone,
  payboxPhone,
  preview = false,
}: GuestFlowWrapperProps) {
  const router = useRouter();
  const instructionsRef = useRef<HTMLDivElement>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);
  const [giftId, setGiftId] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [bankDetails, setBankDetails] = useState<{
    bank_name: string;
    bank_branch: string;
    bank_account_number: string;
    bank_beneficiary_name: string;
    bank_iban: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [markPaidLoading, setMarkPaidLoading] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);

  const {
    register,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<GiftStep1Input>({
    resolver: zodResolver(giftStep1Schema),
    defaultValues: { amount: 100 },
  });

  const amount = watch("amount");

  async function selectPayment(method: PaymentMethod) {
    setServerError(null);
    const data = watch();
    const valid = await giftStep1Schema.safeParseAsync(data);
    if (!valid.success) return;
    const payload = valid.data;

    if (preview) {
      setGiftId("demo-preview");
      setPaymentMethod(method);
      setShowFallback(false);
      if (method === "bank_transfer") setBankDetails(DEMO_BANK);
      else setBankDetails(null);
      if (method === "bit" || method === "paybox") {
        const text = `מתנה ל${eventTitle} – סכום: ₪${payload.amount} – מזל טוב!`;
        navigator.clipboard.writeText(text).catch(() => {});
      }
      return;
    }

    let mediaUrl: string | undefined;
    if (payload.media?.length && payload.media[0]) {
      const up = await uploadGiftMedia(eventId, payload.media[0]);
      if (up.url) mediaUrl = up.url;
    }
    const result = await createGift(eventId, payload, method, mediaUrl);
    if (result?.error) {
      setServerError(result.error);
      return;
    }
    setGiftId(result?.data?.id ?? null);
    setPaymentMethod(method);
    setShowFallback(false);
    if (method === "bank_transfer") {
      const bank = await getEventBankDetailsForGuest(eventId);
      if (bank?.data) setBankDetails(bank.data);
    } else {
      setBankDetails(null);
    }
    if (method === "bit" || method === "paybox") {
      const text = `מתנה ל${eventTitle} – סכום: ₪${payload.amount} – מזל טוב!`;
      navigator.clipboard.writeText(text).catch(() => {});
    }
  }

  useEffect(() => {
    if (paymentMethod && instructionsRef.current) {
      instructionsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [paymentMethod]);

  /** P2P spec: "Gift for [Event Name] – Amount: ₪X – Mazal Tov!" */
  function copyPaymentDetails() {
    const base = `מתנה ל${eventTitle} – סכום: ₪${amount} – מזל טוב!`;
    const text =
      paymentMethod === "bank_transfer" && bankDetails
        ? [base, `מוטב: ${bankDetails.bank_beneficiary_name}, בנק: ${bankDetails.bank_name}, סניף: ${bankDetails.bank_branch}, חשבון: ${bankDetails.bank_account_number}${bankDetails.bank_iban ? `, IBAN: ${bankDetails.bank_iban}` : ""}`].join("\n")
        : base;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function copyReceiverPhone() {
    const phone = paymentMethod === "bit" ? bitPhone : paymentMethod === "paybox" ? payboxPhone : null;
    if (phone) {
      navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function openPaymentApp(method: PaymentMethod) {
    setShowFallback(false);
    const config = PAYMENT_METHODS_CONFIG.find((c) => c.id === method);
    if (!config || config.id === "bank_transfer" || config.id === "credit_card") return;
    const url = getOpenAppUrl(config);
    if (method === "bit") {
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = getBitIntentUrl();
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => setShowFallback(true), 1500);
    } else if (method === "paybox") {
      const isAndroid = /Android/i.test(navigator.userAgent);
      if (isAndroid) {
        window.location.href = getPayBoxIntentUrl();
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => setShowFallback(true), 1500);
    } else {
      window.open(url, "_blank");
    }
  }

  function markPaidAndComplete() {
    setMarkPaidLoading(true);
    setShowThankYou(true);
    setMarkPaidLoading(false);
  }

  if (showThankYou) {
    return (
      <div className="min-h-screen bg-muted/30 py-6 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-lg mx-auto"
        >
          <Heart className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">תודה רבה!</h2>
          <p className="text-muted-foreground mb-6">
            {preview ? "תצוגה מקדימה – המתנה לא נשמרה במערכת." : `המתנה נרשמה. מזהה עסקה: ${giftId?.slice(0, 8) ?? "—"}`}
          </p>
          <Button variant="outline" onClick={() => router.push(preview ? "/demo/guest" : `/e/${eventId}`)}>
            {preview ? "חזרה לתצוגה המקדימה" : "חזרה לדף האירוע"}
          </Button>
        </motion.div>
      </div>
    );
  }

  const amountNum = Number(amount) || 0;
  const hasOpenApp = paymentMethod && paymentMethod !== "bank_transfer" && paymentMethod !== "credit_card";
  const showFallbackUI = showFallback && paymentMethod && (paymentMethod === "bit" || paymentMethod === "paybox");
  const receiverPhone = paymentMethod === "bit" ? bitPhone : paymentMethod === "paybox" ? payboxPhone : null;

  return (
    <div
      className="min-h-screen bg-muted/30 py-6 px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
      style={themeColor ? { ["--primary" as string]: themeColor } : undefined}
    >
      {preview && (
        <div className="max-w-lg mx-auto mb-4 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-800 dark:text-amber-200 px-4 py-2 text-center text-sm font-medium">
          תצוגה מקדימה – דף אורח (לא נשמר במערכת)
        </div>
      )}
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-xl sm:text-2xl font-bold text-center">מתנה ל{ownerDisplayName}</h1>

        {/* פרטים וברכה – כמו Green Invoice: הכל בדף אחד */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">פרטים וברכה</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {serverError && (
              <div className="rounded-md bg-destructive/10 text-destructive text-sm p-3" role="alert">
                {serverError}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="giver_display_name">שם נותן/נותני המתנה</Label>
              <Input
                id="giver_display_name"
                {...register("giver_display_name")}
                placeholder="למשל: משפחת לוי"
                aria-invalid={!!errors.giver_display_name}
              />
              {errors.giver_display_name && (
                <p className="text-sm text-destructive" role="alert">{String(errors.giver_display_name?.message ?? "")}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="blessing_text">ברכה (אופציונלי)</Label>
              <Textarea
                id="blessing_text"
                {...register("blessing_text")}
                rows={3}
                placeholder="מזל טוב!"
                className="resize-none"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="media">תמונה או וידאו (אופציונלי, עד 10MB)</Label>
              <Input id="media" type="file" accept="image/*,video/mp4,video/webm" {...register("media")} />
              {errors.media && (
                <p className="text-sm text-destructive" role="alert">{String(errors.media?.message ?? "")}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="payer_first_name">שם פרטי (משלם)</Label>
                <Input id="payer_first_name" {...register("payer_first_name")} aria-invalid={!!errors.payer_first_name} />
                {errors.payer_first_name && (
                  <p className="text-sm text-destructive" role="alert">{String(errors.payer_first_name?.message ?? "")}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="payer_last_name">שם משפחה</Label>
                <Input id="payer_last_name" {...register("payer_last_name")} aria-invalid={!!errors.payer_last_name} />
                {errors.payer_last_name && (
                  <p className="text-sm text-destructive" role="alert">{String(errors.payer_last_name?.message ?? "")}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>סכום מתנה (₪)</Label>
              <div className="flex flex-wrap gap-2">
                {suggestedAmounts.map((a) => (
                  <Button
                    key={a}
                    type="button"
                    variant={Number(amount) === a ? "default" : "outline"}
                    size="sm"
                    className="min-h-[44px] min-w-[52px]"
                    onClick={() => setValue("amount", a)}
                  >
                    ₪{a}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 items-center pt-1">
                <span className="text-sm text-muted-foreground">או סכום אחר:</span>
                <Input
                  id="amount"
                  type="number"
                  min={10}
                  className="w-28"
                  {...register("amount", { valueAsNumber: true })}
                  aria-invalid={!!errors.amount}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive" role="alert">{String(errors.amount?.message ?? "")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* אמצעי תשלום – כפתורים כמו ב-Green Invoice */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">בחר אמצעי תשלום</CardTitle>
            <p className="text-sm text-muted-foreground">
              מלא את הפרטים למעלה, בחר סכום, ולחץ על אמצעי התשלום. הסכום יועבר לשלב התשלום.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {PAYMENT_METHODS_CONFIG.map((pm) => (
                <button
                  key={pm.id}
                  type="button"
                  onClick={() => selectPayment(pm.id)}
                  disabled={isSubmitting}
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-border bg-card p-4 min-h-[88px] transition-all hover:border-primary hover:bg-primary/5 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50"
                >
                  <PaymentMethodIcon id={pm.id} iconUrl={pm.iconUrl} className="w-12 h-12 shrink-0" />
                  <span className="font-semibold text-sm">{pm.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* אחרי לחיצה על אמצעי תשלום – הוראות עם הסכום מהטקסטבוקס */}
        <AnimatePresence>
          {paymentMethod && (
            <motion.div
              ref={instructionsRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg">הוראות תשלום – {PAYMENT_LABELS[paymentMethod]}</CardTitle>
                  <p className="text-xl font-bold text-primary">
                    סכום לתשלום: {formatCurrency(amountNum)}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {paymentMethod === "bank_transfer" && bankDetails && (
                    <div className="rounded-lg bg-muted p-4 text-sm space-y-2 font-mono">
                      <p><strong>בנק:</strong> {bankDetails.bank_name}</p>
                      <p><strong>סניף:</strong> {bankDetails.bank_branch}</p>
                      <p><strong>חשבון:</strong> {bankDetails.bank_account_number}</p>
                      <p><strong>מוטב:</strong> {bankDetails.bank_beneficiary_name}</p>
                      {bankDetails.bank_iban && (
                        <p><strong>IBAN:</strong> {bankDetails.bank_iban}</p>
                      )}
                    </div>
                  )}

                  <Button variant="outline" className="w-full gap-2 min-h-[44px]" onClick={copyPaymentDetails}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    העתק פרטי תשלום (שם, סכום ₪{amountNum})
                  </Button>

                  {hasOpenApp && (
                    <Button
                      variant="default"
                      className="w-full gap-2 min-h-[44px]"
                      onClick={() => openPaymentApp(paymentMethod)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      פתח ב־{PAYMENT_LABELS[paymentMethod]}
                    </Button>
                  )}

                  {showFallbackUI && receiverPhone && (
                    <div className="rounded-lg border-2 border-dashed border-muted-foreground/40 bg-muted/50 p-4 space-y-3">
                      <p className="text-sm font-medium text-muted-foreground">לא נפתח? העתק את מספר הטלפון וחפש באפליקציה:</p>
                      <p className="text-2xl font-bold tracking-widest text-center select-all" dir="ltr">
                        {receiverPhone}
                      </p>
                      <Button variant="outline" className="w-full gap-2 min-h-[44px]" onClick={copyReceiverPhone}>
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        העתק מספר
                      </Button>
                      <Button
                        variant="secondary"
                        className="w-full gap-2 min-h-[44px]"
                        onClick={() => {
                          const config = PAYMENT_METHODS_CONFIG.find((c) => c.id === paymentMethod);
                          if (config) window.open(config.webUrl, "_blank");
                        }}
                      >
                        <ExternalLink className="h-4 w-4" />
                        פתח אפליקציה ידנית
                      </Button>
                    </div>
                  )}

                  {paymentMethod === "credit_card" && (
                    <p className="text-sm text-muted-foreground text-center">
                      שלחו את פרטי התשלום (שם, סכום ₪{amountNum}) לבעל האירוע או השתמשו בלינק תשלום אם קיבלתם.
                    </p>
                  )}

                  <Button
                    className="w-full gap-2 min-h-[44px]"
                    variant="secondary"
                    onClick={markPaidAndComplete}
                    disabled={markPaidLoading}
                  >
                    {markPaidLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    סימנתי ששילמתי
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
