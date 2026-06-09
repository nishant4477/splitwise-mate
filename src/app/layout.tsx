import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SplitMate — Split Expenses Effortlessly",
  description:
    "The smartest way to split bills, track balances, and settle debts with your roommates. Integrated payment links for Venmo, PayPal, UPI & more.",
  keywords: ["expense splitter", "roommate", "split bills", "venmo", "upi", "debt tracker"],
};

import { SessionProvider } from "@/components/providers/session-provider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark antialiased`}>
      <body className="min-h-screen bg-[#09090b] text-neutral-50 noise-bg">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
