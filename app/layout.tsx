import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteDescription =
  "Check whether a username is available across popular apps, social platforms, and domains.";

export const metadata: Metadata = {
  metadataBase: new URL("https://availifyai.com"),
  title: {
    default: "AvailifyAi - username availability checker",
    template: "%s | AvailifyAi",
  },
  description: siteDescription,
  applicationName: "AvailifyAi",
  keywords: [
    "username availability checker",
    "handle checker",
    "domain availability",
    "brand name checker",
    "social username checker",
  ],
  openGraph: {
    title: "AvailifyAi - username availability checker",
    description: siteDescription,
    url: "/",
    siteName: "AvailifyAi",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AvailifyAi - username availability checker",
    description: siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#07080f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
