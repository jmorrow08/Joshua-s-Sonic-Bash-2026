import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "JJ's 5th Birthday Bash — Sonic Edition",
  description:
    "Gotta go fast! Join us June 13, 2026 at Makutu Island in Chandler, AZ for JJ's Sonic-themed 5th birthday party. RSVP inside!",
  openGraph: {
    title: "JJ's 5th Birthday Bash — Sonic Edition",
    description:
      "Gotta go fast! Join us June 13, 2026 at Makutu Island for JJ's Sonic-themed 5th birthday party.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0A2A6B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
