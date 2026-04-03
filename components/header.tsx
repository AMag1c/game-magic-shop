"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, Crown, CalendarCheck, ChevronDown, X, User, LogOut, Coins } from "lucide-react";
import { fetchGameCategories, type GameCategory } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";

const HOT_KEYWORDS = [
  "3D", "动作", "冒险", "休闲", "像素", "剧情", "单人", "卡通",
  "合作", "奇幻", "射击", "平台", "建造", "开放世界", "恐怖", "战斗",
  "探索", "模拟", "沙盒", "独立", "生存", "科幻", "策略", "角色扮演",
];

export function Header() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<GameCategory[]>([]);

  useEffect(() => {
    fetchGameCategories()
      .then((res) => setCategories((res as GameCategory[]) ?? []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearchOpen(false);
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [searchOpen]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push("/");
  };

  return (
    <>
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Nav */}
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                GameShop
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                >
                  首页
                </Link>
                <div className="group relative">
                  <button
                    onClick={() => router.push("/category")}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-100 transition-colors"
                  >
                    全部游戏
                    <ChevronDown className="h-3 w-3 transition-transform group-hover:rotate-180" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 pt-1 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                    <ul className="w-28 rounded-md border bg-white p-1 shadow-lg">
                      {categories.map((cat) => (
                        <li key={cat.id}>
                          <Link
                            href={`/category?cat=${encodeURIComponent(cat.name)}`}
                            className="block rounded px-2 py-1.5 text-sm text-center hover:bg-gray-100 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </nav>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* 搜索 */}
              <div
                className="relative hidden sm:flex cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                <div className="pl-9 pr-4 h-9 w-56 lg:w-72 flex items-center rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-400 hover:border-blue-400 hover:bg-white transition-colors">
                  搜索游戏...
                </div>
              </div>
              <button
                className="sm:hidden p-2 rounded-md hover:bg-gray-100"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="w-4 h-4" />
              </button>

              <Link href="/favorites" className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors">
                <Heart className="w-4 h-4" />
                <span className="hidden sm:inline">收藏</span>
              </Link>

              <Link
                href="/vip"
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:opacity-90 transition-opacity"
              >
                <Crown className="w-4 h-4" />
                <span className="hidden sm:inline">VIP</span>
              </Link>

              <Link href="/sign-in" className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md border hover:bg-gray-50 transition-colors">
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">签到</span>
              </Link>

              {/* 用户区域 */}
              {isLoggedIn && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline max-w-[80px] truncate">{user.username}</span>
                    <span className="hidden sm:flex items-center gap-0.5 text-yellow-600 text-xs">
                      <Coins className="w-3 h-3" />
                      {user.gameCoins}
                    </span>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-1 w-40 rounded-md border bg-white shadow-lg z-50">
                      <div className="px-3 py-2 border-b text-xs text-gray-500">
                        游戏币：{user.gameCoins}
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        退出登录
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-3 py-2 text-sm rounded-md border hover:bg-gray-50 transition-colors"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 搜索遮罩 */}
      {searchOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-32"
          onClick={() => setSearchOpen(false)}
        >
          <div className="w-full max-w-3xl px-6" onClick={(e) => e.stopPropagation()}>
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="搜索游戏..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 h-14 text-lg bg-white rounded-lg border-0 outline-none"
                autoFocus
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <h3 className="text-white text-sm font-medium mb-3">热门搜索</h3>
              <div className="flex flex-wrap gap-2">
                {HOT_KEYWORDS.map((kw, i) => {
                  const colors = ["bg-pink-500", "bg-orange-500", "bg-green-500", "bg-blue-500", "bg-purple-500", "bg-cyan-500", "bg-red-500", "bg-yellow-500"];
                  return (
                    <button
                      key={kw}
                      onClick={() => {
                        router.push(`/search?q=${encodeURIComponent(kw)}`);
                        setSearchOpen(false);
                      }}
                      className={`${colors[i % colors.length]} text-white text-xs px-2 py-1 rounded hover:opacity-80 transition-opacity`}
                    >
                      {kw}
                    </button>
                  );
                })}
              </div>
            </div>
            <p className="text-white/60 text-sm mt-4 text-center">按 ESC 键关闭</p>
          </div>
        </div>
      )}
    </>
  );
}
