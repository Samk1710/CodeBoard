import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Body } from "@/components/layout/Body";
import { Navbar } from "@/components/layout/Navbar";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Code Board",
  description: "Transform repository knowledge into instant developer insights",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <Body>
        <Navbar />
        {children}
      </Body>
    </html>
  );
}
