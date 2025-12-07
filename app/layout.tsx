import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Strapi REST Query Builder",
  description: "Visual Query Builder for Strapi REST API endpoints",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
