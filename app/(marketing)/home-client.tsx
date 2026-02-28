"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gift, Calendar, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HomeClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-background to-background" />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover opacity-40"
          >
            <source src="/hero-bg.mp4" type="video/mp4" />
          </video>
        </div>
        <div className="relative z-10 w-full max-w-4xl mx-auto px-4 py-16 text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Gifted
          </motion.h1>
          <motion.p
            className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            מתנות דיגיטליות וברכות לחתונות ולאירועים – במקום אחד, פשוט וברור
          </motion.p>
          <motion.div
            className="flex flex-wrap gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button asChild size="lg" className="text-base">
              <Link href="/admin">כניסה למנהל</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base">
              <Link href="/demo/guest">צפה בדף תשלום אורח</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">איך זה עובד?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Calendar, title: "יוצרים אירוע", text: "ממלאים פרטים פעם אחת – תאריך, מקום, פרטי חשבון לקבלת מתנות." },
              { icon: Gift, title: "משתפים עם אורחים", text: "שולחים לינק או QR. האורחים נכנסים, כותבים ברכה ובוחרים סכום." },
              { icon: Shield, title: "מנהלים במקום אחד", text: "רואים דוחות, סטטוס תשלומים והכל מאובטח ומוגן." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className="bg-card rounded-xl p-6 border shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <item.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">יתרונות</h2>
          <ul className="space-y-4 max-w-2xl mx-auto text-muted-foreground">
            {[
              "תשלום דיגיטלי – BIT, PayBox, PayPal, העברה בנקאית ועוד",
              "ברכות ותמונות במקום אחד – לא מאבדים כלום",
              "דוחות ו-CSV – נוח לניהול ולדיווח",
              "מתאים למובייל – אורחים יכולים לתת מתנה מהטלפון",
            ].map((item, i) => (
              <motion.li
                key={i}
                className="flex items-start gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <span className="text-primary mt-0.5">•</span>
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 bg-muted/40">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">אבטחה ופרטיות</h2>
          <p className="text-muted-foreground">
            פרטי הבנק נשמרים בצורה מאובטחת ומוצגים רק באישור בעל האירוע. רק אתה רואה את דוחות התשלומים והברכות.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="container max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">שאלות נפוצות</h2>
          <div className="space-y-6">
            {[
              { q: "האם צריך להתקין אפליקציה?", a: "לא. הכל עובד בדפדפן – גם במחשב וגם במובייל." },
              { q: "איך האורחים משלמים?", a: "בחירת אמצעי תשלום (BIT, PayBox, PayPal, העברה בנקאית וכו׳), הזנת פרטים וסכום – ומקבלים הוראות ברורות להשלמת התשלום." },
              { q: "האם יש עמלות?", a: "תלוי באמצעי התשלום שבחרת. המערכת עצמה מאפשרת איסוף מתנות ודוחות – העמלות הן לפי הספק (BIT, PayBox וכו׳)." },
            ].map((item, i) => (
              <div key={i} className="border rounded-lg p-4 bg-card">
                <h3 className="font-semibold flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {item.q}
                </h3>
                <p className="text-muted-foreground text-sm mt-2 pr-6">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-8 mt-auto">
        <div className="container max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-muted-foreground">Gifted – מתנות דיגיטליות לאירועים</span>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin">כניסה למנהל</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
