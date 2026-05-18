"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, Map, UserCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BottomNav({ className }: { className?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/user/explore", label: "Home", icon: Home },
    { href: "/user/activity", label: "Activity", icon: Activity },
    { href: "/map", label: "Map", icon: Map },
    { href: "/profile", label: "Profile", icon: UserCircle },
  ];

  return (
    <div className={cn("w-full px-6 pb-6 safe-area-bottom z-40 flex justify-center pointer-events-none", className || "fixed bottom-0")}>
      <div className="glass-dark rounded-[32px] flex justify-around items-center p-2 w-full max-w-md pointer-events-auto shadow-2xl">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex flex-col items-center justify-center p-2 rounded-2xl relative transition-all duration-300 w-16",
                isActive ? "text-emerald-500" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-emerald-500/10 rounded-2xl border border-emerald-500/20"
                />
              )}
              <Icon className={cn("w-5 h-5 mb-1 z-10 transition-transform", isActive && "scale-110")} />
              <span className="text-[8px] font-black uppercase tracking-tighter z-10">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
