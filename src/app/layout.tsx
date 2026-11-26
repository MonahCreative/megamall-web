import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "@fontsource-variable/outfit";
import "./globals.css";
import { SITE_URL } from "@/lib/site";
import { CartDrawer } from "@/components/cart-drawer";
import { Footer } from "@/components/footer";
import { Header, HeaderFallback } from "@/components/header";
import { ThemeColours } from "@/components/theme-colours";
import { WhatsAppButton } from "@/components/whatsapp-button";

const description =
  "Online shop in Tanzania: electronics, home and kitchen, fashion, beauty and more. Free delivery and pay on delivery in Dar es Salaam; delivery to all 31 regions by bus.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mega Mall Tanzania: online shop, free delivery in Dar", template: "%s | Mega Mall Tanzania" },
  applicationName: "Mega Mall Tanzania",
  // Proves to Google Search Console that this site is ours (set GOOGLE_SITE_VERIFICATION in .env.production).
  verification: process.env.GOOGLE_SITE_VERIFICATION ? { google: process.env.GOOGLE_SITE_VERIFICATION } : undefined,
  description,
  // Default preview when a shop link is shared on WhatsApp, Facebook, X...; product pages set their own.
  openGraph: { type: "website", siteName: "Mega Mall Tanzania", locale: "en_TZ", title: "Mega Mall Tanzania", description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#1E2B5D" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Suspense fallback={null}>
          <ThemeColours />
        </Suspense>
        <Suspense fallback={<HeaderFallback />}>
          <Header />
        </Suspense>
        <main className="flex-1">{children}</main>
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
        <CartDrawer />
        <Suspense fallback={null}>
          <WhatsAppButton />
        </Suspense>
      </body>
    </html>
  );
}
