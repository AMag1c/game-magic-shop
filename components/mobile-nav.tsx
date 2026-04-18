"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Gamepad2, Grid3x3, Search, Heart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";

const NAV_ITEMS = [
  { href: "/", icon: Gamepad2, label: "首页" },
  { href: "/category", icon: Grid3x3, label: "浏览" },
  { href: "__search__", icon: Search, label: "搜索" },
  { href: "/favorites", icon: Heart, label: "收藏" },
  { href: "__profile__", icon: User, label: "我的" },
];

interface MobileNavProps {
  onSearchClick?: () => void;
}

export function MobileNav({ onSearchClick }: MobileNavProps) {
  const pathname = usePathname();
  const { isLoggedIn } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-steam-dark border-t border-white/5">
      <div className="flex items-center justify-around h-14">
        {NAV_ITEMS.map((item) => {
          const isSearch = item.href === "__search__";
          const isProfile = item.href === "__profile__";
          const href = isProfile ? (isLoggedIn ? "/sign-in" : "/auth/login") : item.href;
          const isActive = !isSearch && !isProfile && pathname === item.href;

          if (isSearch) {
            return (
              <button
                key={item.label}
                onClick={onSearchClick}
                className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground cursor-pointer"
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive && "text-primary")} />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
