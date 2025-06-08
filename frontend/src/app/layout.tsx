import type { Metadata } from "next";
import { Geist } from "next/font/google"; // Simplified import for Geist Sans
import { GeistMono } from "next/font/google"; // Corrected import for Geist Mono
import "./globals.css";
import { ConvexClientProvider } from "./ConvexClientProvider"; // Import the new provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // Added for font display strategy
});

const geistMono = GeistMono({ // Corrected variable name to match common practice
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap', // Added for font display strategy
});

export const metadata: Metadata = {
  title: "tell me.more – Psicologia guiada por IA com empatia real", // Using the provided title
  description: "Plataforma de psicologia guiada por IA com foco em empatia e suporte acessível.", // Example description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR"> {/* Assuming Portuguese based on title */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>{children}</ConvexClientProvider>
      </body>
    </html>
  );
}
