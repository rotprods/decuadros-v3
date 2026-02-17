import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#FAF9F6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "De Cuadros — Fusión Mediterránea",
  description: "Cocina de fusión mediterránea premium en Alguazas. App con gamificación y experiencia de lujo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${playfair.variable} ${cormorant.variable} antialiased min-h-screen`}
        style={{ fontFamily: "'Inter', sans-serif", background: "#FAF9F6", color: "#2C2C2C" }}
      >
        {children}
      </body>
    </html>
  );
}
