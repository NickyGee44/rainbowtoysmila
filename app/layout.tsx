import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Rainbow Toys by Mila | Cute 3D Printed Toys",
  description: "Adorable 3D-printed toys made with love by Mila. Pick a toy, choose a color, and we'll make it for you!",
  keywords: ["3D printed toys", "kids toys", "rainbow toys", "Mila", "cute toys", "handmade toys"],
  manifest: "/manifest.json",
  themeColor: "#ec4899",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rainbow Toys",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "Rainbow Toys by Mila 🌈",
    description: "Adorable 3D-printed toys made with love by Mila. Pick a toy, choose a color, and we'll make it for you!",
    images: [
      {
        url: "/poster.png",
        width: 1200,
        height: 630,
        alt: "Rainbow Toys by Mila",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rainbow Toys by Mila 🌈",
    description: "Adorable 3D-printed toys made with love by Mila!",
    images: ["/poster.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${nunito.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
