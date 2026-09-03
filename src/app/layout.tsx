import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZYQWAX Developer Portal",
  description: "ZYQWAX OAuth uygulamalarını yönet.",
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  );
}
