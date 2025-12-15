import HeaderWrapper from "./components/HeaderWrapper";
import MobileBottomNav from "./components/MobileBottomNav"; // Import directly

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* Dynamic Header (Streams in) */}
      <HeaderWrapper />

      <main className="flex-1 pb-16 md:pb-0">
        {children}
      </main>

      <footer className="bg-white border-t py-8 text-center text-sm text-gray-500 hidden md:block">
        <p>© 2025 Ravi Variety. All rights reserved.</p>
      </footer>

      {/* Static Footer (Instant Render) */}
      <MobileBottomNav />
      
    </div>
  );
}