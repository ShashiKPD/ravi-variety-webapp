import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { CartProvider } from "@/lib/context/CartContext";
import FloatingCartBar from "@/app/(main)/components/cart/FloatingCartBar";
import { Toaster } from "sonner";
import "./globals.css";

const nunito = Nunito({ 
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"] 
});

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
      <body className={nunito.className}>
        <CartProvider>
          {children}
          <FloatingCartBar />
          <Toaster richColors position="top-center" /> 
        </CartProvider>
      </body>
    </html>
  );
}