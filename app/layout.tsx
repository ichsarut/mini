import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ปฏิทินการจองวันลา",
  description: "จองวันลา",
  // Enhanced metadata for LINE MINI App Share feature
  // These will be used when users share the app via the built-in Share option
  openGraph: {
    title: "ปฏิทินการจองวันลา",
    description: "จองวันลา",
    type: "website",
    // Note: The image used in Share will be from Channel icon in LINE Developers Console
    // Make sure to set a proper Channel icon in the Channel Basic settings tab
  },
  twitter: {
    card: "summary",
    title: "ปฏิทินการจองวันลา",
    description: "จองวันลา",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body>
        <Script
          src="https://static.line-scdn.net/liff/edge/versions/2.22.0/sdk.js"
          strategy="beforeInteractive"
        />
        {children}
      </body>
    </html>
  );
}
