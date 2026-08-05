import type { Metadata } from "next";
import Footer from "@/components/Footer";
import VoucherFloatingButton from "@/components/VoucherFloatingButton";
import ScrollToTop from "@/components/ScrollToTop";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://void-market.com"
  ),

  title: {
    default: "VOID MARKET",
    template: "%s | VOID MARKET",
  },

  description:
    "Premium streetwear and authentic clothing.",

  openGraph: {
    title: "VOID MARKET",
    description:
      "Premium streetwear and authentic clothing.",
    url: "https://void-market.com",
    siteName: "VOID MARKET",
    images: [
      {
        url: "/og-image.png",
        width: 1254,
        height: 1254,
        alt: "VOID MARKET logo",
      },
    ],
    locale: "ro_RO",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "VOID MARKET",
    description:
      "Premium streetwear and authentic clothing.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>
        <ScrollToTop />

        {children}

        <Footer />

        <VoucherFloatingButton />
      </body>
    </html>
  );
}