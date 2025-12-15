"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid, User, History } from "lucide-react"; // Switched to History icon

export default function MobileBottomNav() {
  const pathname = usePathname();
  
  // Hide nav on product details to give more screen space
  const shouldHideNav = pathname.startsWith("/p/");

  if (shouldHideNav) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/categories", icon: Grid },
    { label: "Order Again", href: "/orders", icon: History }, // Updated Label & Icon
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 h-16 pb-safe md:hidden shadow-[0_-1px_3px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-full">
        {navItems.map((item) => {
          // Highlight logic: Active if exact match OR if it's a sub-path (except for Home '/')
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 ${
                isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <item.icon 
                className={`w-6 h-6 ${isActive ? "fill-current/10" : ""}`} 
                strokeWidth={isActive ? 2.5 : 2} 
              />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}