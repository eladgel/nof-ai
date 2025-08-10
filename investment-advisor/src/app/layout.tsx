import type { Metadata } from "next";
import { Assistant } from "next/font/google";
import "./globals.css";

const assistant = Assistant({
  subsets: ["hebrew"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "מערכת המלצות השקעות ישראלית",
  description: "השוו עמלות בנקים וקבלו המלצות מותאמות אישית לתיק ההשקעות שלכם",
  keywords: ["השקעות", "בנקים", "עמלות", "ייעוץ פיננסי", "ישראל"],
  authors: [{ name: "Investment Advisor System" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className={`${assistant.className} antialiased`}>
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  );
}
