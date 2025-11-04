import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "ปฏิทินการจองวันลา",
  description: "จองวันลา",
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
