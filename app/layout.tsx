import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner"; // <--- 1. Import Toaster
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Ravi Variety",
  description: "Product showcase for Ravi Variety",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        {/* 2. Add Toaster here. 'richColors' makes success green / error red automatically. */}
        <Toaster richColors position="top-center" /> 
      </body>
    </html>
  );
}