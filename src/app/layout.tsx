import type { Metadata } from "next";
import { Space_Grotesk, Outfit } from "next/font/google";
import { Providers } from "@/components/providers/Providers";
import { ClerkProvider } from "@clerk/nextjs";
import { CookieBanner } from "@/components/layout/CookieBanner";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CosmosDaily - O Universo Ao Vivo, Todo Dia",
  description: "Fotos, missões, asteroides e satélites da NASA em tempo real — em português",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${spaceGrotesk.variable} ${outfit.variable}`}>
        <body className="antialiased overflow-x-hidden">
          <Providers>
            {children}
            <CookieBanner />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}