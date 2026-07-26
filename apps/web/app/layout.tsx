import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "New Raj Interior CRM",
  description: "Design system for New Raj Interior Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-sans">{children}</body>
    </html>
  );
}
