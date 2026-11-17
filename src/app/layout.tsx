
import type { Metadata } from "next";
import "./globals.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Meridian Capital Intelligence",
  description: "Portfolio Analytics Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
