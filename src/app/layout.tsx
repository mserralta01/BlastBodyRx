import type { Metadata } from "next";
import { Archivo, Manrope } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Archivo({ subsets: ["latin"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin"], variable: "--font-body" });

export const metadata: Metadata = {
  title: { default: "BlastBodyRx — Research Compounds & Batch Documentation", template: "%s — BlastBodyRx" },
  description: "Documentation-first research compounds with variant-level labeling and accessible batch certificates.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-scroll-behavior="smooth"><body className={`${display.variable} ${body.variable}`}><Providers>{children}</Providers></body></html>;
}
