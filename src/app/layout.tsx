import type { Metadata } from "next";
import { JetBrains_Mono, Nunito, Patrick_Hand } from "next/font/google";
import "@/app/globals.css";

const hand = Patrick_Hand({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-hand",
});

const sans = Nunito({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Persiapan Psikotes Kementerian Keuangan",
  description: "Platform belajar independen untuk latihan psikotes hitung cepat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${hand.variable} ${sans.variable} ${mono.variable}`}>{children}</body>
    </html>
  );
}

