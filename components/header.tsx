"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Crown, CalendarCheck, User, LogOut, Coins, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/auth-context";
import { useCategories } from "@/lib/hooks/use-categories";
import { CommandSearch } from "@/components/command-search";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  const pathname = usePathname();
  const { user, isLoggedIn, logout } = useAuth();
  const { data: categories } = useCategories();

  return (
    <header className="steam-nav border-b border-white/5 sticky top-0 z-40">
      <div className="max-w-[1200px] mx-auto px-4">
        <div className="flex items-center h-12 gap-4">
          {/* Logo */}
          <Link href="/" className="text-lg font-bold text-steam-blue hover:text-steam-blue-hover transition-colors flex-shrink-0">
            GAMESHOP
          </Link>

          {/* 导航链接 */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link
              href="/"
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors",
                pathname === "/" ? "bg-steam-light/60 text-white" : "text-steam-text hover:text-white hover:bg-steam-light/40"
              )}
            >
              商店
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors cursor-pointer",
                  pathname.startsWith("/category") ? "bg-steam-light/60 text-white" : "text-steam-text hover:text-white hover:bg-steam-light/40"
                )}>
                  分类
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-36">
                <DropdownMenuItem asChild className="cursor-pointer text-xs">
                  <Link href="/category">全部游戏</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {categories?.map((cat) => (
                  <DropdownMenuItem key={cat.id} asChild className="cursor-pointer text-xs">
                    <Link href={`/category?cat=${encodeURIComponent(cat.name)}`}>{cat.name}</Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              href="/sign-in"
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors",
                pathname === "/sign-in" ? "bg-steam-light/60 text-white" : "text-steam-text hover:text-white hover:bg-steam-light/40"
              )}
            >
              签到
            </Link>

            <Link
              href="/vip"
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors",
                pathname === "/vip" ? "bg-vip/20 text-vip" : "text-vip/80 hover:text-vip hover:bg-vip/10"
              )}
            >
              VIP
            </Link>

            <Link
              href="/favorites"
              className={cn(
                "px-3 py-1.5 text-[13px] font-medium rounded-sm transition-colors",
                pathname === "/favorites" ? "bg-steam-light/60 text-white" : "text-steam-text hover:text-white hover:bg-steam-light/40"
              )}
            >
              收藏
            </Link>
          </nav>

          {/* 搜索 + 用户信息 (同一行) */}
          <div className="flex items-center gap-3">
            <CommandSearch />

            {isLoggedIn && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 text-[12px] text-steam-text-dim hover:text-steam-text transition-colors cursor-pointer whitespace-nowrap">
                    <User className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{user.username}</span>
                    <span className="text-steam-blue flex items-center gap-0.5">
                      <Coins className="w-3 h-3" />{user.gameCoins}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs">{user.username}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/favorites"><Heart className="w-3 h-3 mr-2" />我的收藏</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/sign-in"><CalendarCheck className="w-3 h-3 mr-2" />每日签到</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="cursor-pointer text-xs">
                    <Link href="/vip"><Crown className="w-3 h-3 mr-2 text-vip" />VIP 会员</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-xs text-destructive focus:text-destructive">
                    <LogOut className="w-3 h-3 mr-2" />退出
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth/login" className="text-[12px] text-steam-text-dim hover:text-steam-text transition-colors whitespace-nowrap">
                登录
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
