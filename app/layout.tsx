import type { Metadata } from "next";
import VoucherFloatingButton from "@/components/VoucherFloatingButton";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOID MARKET",
  description: "Premium Streetwear Marketplace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro">
      <body>
        {children}
        <VoucherFloatingButton />
      </body>
    </html>
  );
}