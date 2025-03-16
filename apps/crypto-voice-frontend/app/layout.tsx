import "@livekit/components-styles";
import { Manrope } from "next/font/google";
import { Providers } from "../providers/Providers";
import "./globals.css";
import type { Metadata } from "next";

const manrope400 = Manrope({
  subsets: ['latin-ext'],
  weight: ['300', '500'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "codefunded | crypto voice assistant demo",
  description: "codefunded - blockchain and crypto solutions",
  metadataBase: new URL("https://codefunded.com"),
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${manrope400.className}`}>
      <body className="h-full">
        <main className="flex min-h-screen items-center justify-center p-4">
          <Providers>{children}</Providers>
        </main>
      </body>
    </html>
  );
}