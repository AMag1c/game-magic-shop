"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Clock, X, Gamepad2, Coins } from "lucide-react";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import { useCategories } from "@/lib/hooks/use-categories";
import { useGames } from "@/lib/hooks/use-games";
import type { GameItem } from "@/lib/api";

const RECENT_SEARCHES_KEY = "gms_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

export function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const { data: categories } = useCategories();
  const { data: searchResults } = useGames(
    debouncedQuery.length >= 2 ? { keyword: debouncedQuery, current: 1, size: 5 } : {}
  );

  // 防抖
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 加载最近搜索
  useEffect(() => {
    if (open) setRecentSearches(getRecentSearches());
  }, [open]);

  // 全局快捷键 Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSelect = useCallback(
    (value: string) => {
      setOpen(false);
      setQuery("");
      router.push(value);
    },
    [router]
  );

  const handleSearch = useCallback(() => {
    if (!query.trim()) return;
    addRecentSearch(query.trim());
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery("");
  }, [query, router]);

  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
  }, []);

  const results = debouncedQuery.length >= 2 ? (searchResults?.list ?? []) : [];

  return (
    <>
      {/* 触发按钮 - 供外部使用 */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/50 bg-white/5 text-sm text-muted-foreground hover:bg-white/10 hover:border-primary/50 transition-colors cursor-pointer"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline">搜索游戏...</span>
        <kbd className="hidden lg:inline-flex h-5 items-center gap-0.5 rounded border border-border/50 bg-muted px-1.5 text-[10px] text-muted-foreground">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="搜索游戏名称..."
          value={query}
          onValueChange={setQuery}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !results.length) handleSearch();
          }}
        />
        <CommandList>
          <CommandEmpty>
            {query.trim() ? (
              <div className="py-6 text-center text-sm">
                <p className="text-muted-foreground">未找到相关游戏</p>
                <button
                  onClick={handleSearch}
                  className="mt-2 text-primary hover:underline cursor-pointer"
                >
                  搜索「{query}」
                </button>
              </div>
            ) : (
              <p className="text-muted-foreground">输入关键词搜索</p>
            )}
          </CommandEmpty>

          {/* 搜索结果 */}
          {results.length > 0 && (
            <CommandGroup heading="搜索结果">
              {results.map((game: GameItem) => (
                <CommandItem
                  key={game.id}
                  value={`game-${game.id}-${game.name}`}
                  onSelect={() => handleSelect(`/game/${game.id}`)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0 relative">
                    <Image
                      src={game.coverImage || "/game-sample.jpg"}
                      alt={game.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{game.name}</p>
                    <p className="text-xs text-muted-foreground">{game.category}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-0.5">
                    <Coins className="w-3 h-3" />
                    {game.price === 0 ? "免费" : game.price}
                  </span>
                </CommandItem>
              ))}
              {query.trim() && (
                <CommandItem
                  value={`search-all-${query}`}
                  onSelect={handleSearch}
                  className="cursor-pointer"
                >
                  <Search className="w-4 h-4 mr-2" />
                  搜索「{query}」的全部结果
                </CommandItem>
              )}
            </CommandGroup>
          )}

          {/* 最近搜索 */}
          {recentSearches.length > 0 && !debouncedQuery && (
            <CommandGroup heading="最近搜索">
              {recentSearches.map((term) => (
                <CommandItem
                  key={term}
                  value={`recent-${term}`}
                  onSelect={() => {
                    addRecentSearch(term);
                    handleSelect(`/search?q=${encodeURIComponent(term)}`);
                  }}
                  className="cursor-pointer"
                >
                  <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                  {term}
                </CommandItem>
              ))}
              <CommandItem
                value="clear-recent"
                onSelect={handleClearRecent}
                className="cursor-pointer text-muted-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                清除搜索记录
              </CommandItem>
            </CommandGroup>
          )}

          {/* 分类 */}
          {!debouncedQuery && categories && categories.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="游戏分类">
                {categories.map((cat) => (
                  <CommandItem
                    key={cat.id}
                    value={`cat-${cat.name}`}
                    onSelect={() => handleSelect(`/category?cat=${encodeURIComponent(cat.name)}`)}
                    className="cursor-pointer"
                  >
                    <Gamepad2 className="w-4 h-4 mr-2 text-muted-foreground" />
                    {cat.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
