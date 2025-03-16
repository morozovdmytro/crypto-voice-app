import "@livekit/components-styles";
import { Manrope } from "next/font/google";
import { Providers } from "../providers/Providers";
import "./globals.css";

const manrope400 = Manrope({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full ${manrope400.className}`}>
      <body className="h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}