import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Shepherd Garde | Lujo Suave y Escultural",
  description: "Exclusive drops and essential streetwear styles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-[family-name:var(--font-inter)] min-h-screen antialiased flex flex-col bg-[#FDFBF7] text-[#2D2B2A]`}>
        <Navbar />
        <main className="flex-1 flex flex-col items-center">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
