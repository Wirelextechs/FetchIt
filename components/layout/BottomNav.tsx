"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Map, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home", icon: Home },
    { href: "/user/activity", label: "Activity", icon: Activity },
    { href: "/map", label: "Map", icon: Map },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 safe-area-bottom z-40 flex justify-center">
      <div className="flex justify-around items-center p-2 w-full max-w-lg">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-xl transition-colors w-16",
                isActive ? "text-emerald-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              )}
            >
              <Icon className={cn("w-6 h-6 mb-1", isActive && "fill-emerald-100")} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
