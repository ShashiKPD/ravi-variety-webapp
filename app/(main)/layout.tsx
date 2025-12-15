import { Suspense } from "react";
import Header from "./components/Header";
import AuthButtons from "./components/AuthButtons"; // The new server component
import MobileBottomNav from "./components/MobileBottomNav";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* ✅ HEADER COMPOSITION 
         1. <Header> renders instantly (Client Component)
         2. authSlot streams in asynchronously (Server Component)
      */}
      <Header 
        authSlot={
          <Suspense fallback={<div className="h-[33.5px] w-24 bg-gray-100 rounded-full animate-pulse" />}>
            <AuthButtons />
          </Suspense>
        }
      />

      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500 hidden md:block">
        <p>© 2025 Ravi Variety. All rights reserved.</p>
      </footer>

      <MobileBottomNav />
      
    </div>
  );
}