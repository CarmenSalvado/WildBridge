import type { Metadata } from "next";
import "leaflet/dist/leaflet.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "WildBridge — Rebuild urban nature",
  description: "See how your smallest green space could become a stepping stone for urban habitat.",
  openGraph: {
    title: "WildBridge — Small spaces, stronger habitat connections",
    description: "Map real habitat gaps, place your green space, and calculate its potential connectivity impact.",
    images: [{ url: "/assets/wildbridge-hackathon-cover.png", width: 1536, height: 1024, alt: "WildBridge over a forest bridge landscape" }],
  },
  twitter: { card: "summary_large_image", images: ["/assets/wildbridge-hackathon-cover.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
