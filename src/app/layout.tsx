import type { Metadata } from "next";
import { cormorant, syne, dmSans } from "./fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "Groovy Analytics",
  description: "Dashboard consolidado del ecosistema Groovy Music Store",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${cormorant.variable} ${syne.variable} ${dmSans.variable}`}>
      <body>{children}</body>
    </html>
  );
}