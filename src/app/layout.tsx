import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZYQWAX Developer Portal",
  description: "ZYQWAX OAuth uygulamalarını yönet.",
  icons: {
    icon: [
      { url: "/icon.png", type: "image/png" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    apple: "/apple-icon.png",
  },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
