"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, ShoppingCart, User } from "lucide-react";

export default function MobileBottomNav({ cartCount }: { cartCount: number }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Grid }, // We will build this page in Phase 3
    { label: "Account", href: "/account", icon: User },
    { label: "Cart", href: "/cart", icon: ShoppingCart, hasBadge: true },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 pb-safe md:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                isActive ? "text-blue-600" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <item.icon className={`w-6 h-6 ${isActive ? "fill-current" : ""}`} strokeWidth={isActive ? 2.5 : 2} />
                
                {item.hasBadge && cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold h-4 min-w-[16px] px-1 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}