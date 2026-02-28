import type { Metadata } from "next";
import { Heebo } from "next/font/google";
import "./globals.css";

const heebo = Heebo({
  subsets: ["latin", "hebrew"],
  variable: "--font-heebo",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gifted | מתנות דיגיטליות לאירועים וחתונות",
  description:
    "מערכת מתנות דיגיטליות לחתונות, בר מצווה ואירועים. איסוף ברכות ותשלומים במקום אחד.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl" className={heebo.variable}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
