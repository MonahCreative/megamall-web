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
  "Fashion, phones, electronics, home, beauty, groceries and more. Pay on delivery in Dar es Salaam, or pay by mobile money and get delivery to all 31 regions of Tanzania.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Mega Mall Tanzania: shop online, pay on delivery in Dar", template: "%s | Mega Mall Tanzania" },
  description,
  // Default preview when a shop link is shared on WhatsApp, Facebook, X...; product pages set their own.
  openGraph: { type: "website", siteName: "Mega Mall Tanzania", locale: "en_TZ", title: "Mega Mall Tanzania", description },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { themeColor: "#e8650c" };

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
