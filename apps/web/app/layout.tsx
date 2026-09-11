import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Cardly — Twoja wizytówka, zawsze pod ręką",
  description:
    "Twórz cyfrowe wizytówki, wymieniaj się kontaktem przez NFC lub QR, i buduj listę zaufanych specjalistów. Cardly na iOS i Androida.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" className={spaceGrotesk.variable}>
      <body>{children}</body>
    </html>
  );
}
