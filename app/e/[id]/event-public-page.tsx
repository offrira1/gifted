"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Gift, Share2, Smartphone } from "lucide-react";

interface EventPublicPageProps {
  eventId: string;
  giftUrl: string;
  title: string;
  welcomeText: string | null;
  coverMediaUrl: string | null;
  themeColor?: string;
}

export function EventPublicPage({ eventId, giftUrl, title, welcomeText, coverMediaUrl, themeColor }: EventPublicPageProps) {
  const shareUrl = typeof window !== "undefined" ? window.location.href : "";

  function handleShare() {
    if (navigator.share) {
      navigator.share({
        title: "Gifted – מתנה לאירוע",
        url: shareUrl,
        text: "הצטרפו לאירוע והביאו מתנה דיגיטלית",
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col pb-[env(safe-area-inset-bottom)]"
      style={themeColor ? { ["--primary" as string]: themeColor } : undefined}
    >
      <div className="relative min-h-[40dvh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 to-background">
        {coverMediaUrl && (
          <Image
            src={coverMediaUrl}
            alt=""
            fill
            className="object-cover opacity-30"
            sizes="100vw"
            unoptimized={coverMediaUrl.startsWith("data:") || !coverMediaUrl.includes("supabase")}
          />
        )}
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-12 text-center">
          <motion.h1
            className="text-2xl sm:text-3xl font-bold text-foreground mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {title}
          </motion.h1>
          {welcomeText && (
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">{welcomeText}</p>
          )}
          <p className="text-foreground/90 mb-8">
            שמחים לראותכם. ניתן להביא מתנה גם באמצעות מערכת Gifted.
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg mx-auto px-4 py-8 flex-1">
        <motion.section
          className="rounded-2xl border bg-card p-6 shadow-sm mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white rounded-xl inline-block">
              <QRCodeSVG value={giftUrl} size={180} level="M" />
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mb-4">
            סרקו את ה-QR לפתיחה במובייל
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Button variant="outline" size="sm" asChild>
              <a href={giftUrl}>
                <Smartphone className="h-4 w-4 me-2" />
                פתח במובייל
              </a>
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 me-2" />
              שלח לעצמי לינק
            </Button>
          </div>
        </motion.section>

        <p className="text-center text-muted-foreground text-sm mb-6">
          הצמד את הפלאפון (סריקת QR או לחיצה על הלינק)
        </p>

        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button asChild size="lg" className="text-lg px-8">
            <Link href={`/g/${eventId}`}>
              <Gift className="h-5 w-5 me-2" />
              לתת מתנה עכשיו
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
