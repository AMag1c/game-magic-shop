"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, Gamepad2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GameCard } from "@/components/game-card";
import { Card, CardContent } from "@/components/ui/card";
import { fetchGameList, fetchGameCategories, type GameItem, type GameCategory } from "@/lib/api";

const SORT_OPTIONS = [
  { label: "综合", value: "" },
  { label: "热度", value: "downloads" },
  { label: "评分", value: "rating" },
  { label: "最新", value: "createTime" },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [games, setGames] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const categoriesRef = useRef<GameCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCat, setSelectedCat] = useState("all");
  const [selectedSort, setSelectedSort] = useState("");
  const [categoriesReady, setCategoriesReady] = useState(false);

  useEffect(() => {
    fetchGameCategories()
      .then((res: any) => {
        const cats = res ?? [];
        setCategories(cats);
        categoriesRef.current = cats;
        setCategoriesReady(true);
      })
      .catch(() => {
        setCategories([]);
        setCategoriesReady(true);
      });
  }, []);

  useEffect(() => {
    if (!q || !categoriesReady) { if (!q) setGames([]); return; }
    setLoading(true);
    const params: any = { keyword: q, current: 1, size: 50 };
    if (selectedCat !== "all") {
      const found = categoriesRef.current.find((c) => c.name === selectedCat);
      if (found) params.categoryId = found.id;
    }
    fetchGameList(params)
      .then((res: any) => {
        let list: GameItem[] = res?.list ?? res ?? [];
        if (selectedSort === "downloads") list = [...list].sort((a, b) => b.downloads - a.downloads);
        if (selectedSort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
        setGames(list);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [q, selectedCat, selectedSort, categoriesReady]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-100">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <form onSubmit={handleSearch} className="flex gap-3 max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="搜索游戏名称..."
                  className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-xl text-sm focus:outline-none focus:bg-white/30 focus:border-white/50"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-white text-primary rounded-xl text-sm font-semibold hover:bg-white/90 transition-colors"
              >
                搜索
              </button>
            </form>
            {q && (
              <p className="text-white/70 text-sm text-center mt-3">
                搜索「<span className="text-white font-medium">{q}</span>」，共找到 {loading ? "..." : games.length} 个结果
              </p>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-4">
          {/* 分类和排序筛选 */}
          {q && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button
                    onClick={() => setSelectedCat("all")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedCat === "all" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                  >
                    全部
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCat(c.name)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${selectedCat === c.name ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"}`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">排序：</span>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedSort(opt.value)}
                      className={`px-3 py-1 text-xs rounded-lg transition-all ${selectedSort === opt.value ? "bg-primary/10 text-primary font-medium" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* 无结果 */}
          {!loading && q && games.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Gamepad2 className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">未找到相关游戏</h3>
                <p className="text-gray-400 text-sm">试试其他关键词</p>
              </CardContent>
            </Card>
          )}

          {/* 无关键词提示 */}
          {!q && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Search className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">输入关键词开始搜索</h3>
                <p className="text-gray-400 text-sm">支持游戏名称、英文名搜索</p>
              </CardContent>
            </Card>
          )}

          {/* 结果列表 */}
          {!loading && games.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {games.map((game) => (
                <GameCard key={game.id} game={game} showPriceBadge />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
