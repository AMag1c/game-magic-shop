"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Gamepad2 } from "lucide-react";
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

const PRICE_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "免费", value: "free" },
  { label: "付费", value: "paid" },
  { label: "会员价", value: "member" },
];

function CategoryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cat = searchParams.get("cat") || "all";

  const [games, setGames] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const categoriesRef = useRef<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(cat);
  const [selectedSort, setSelectedSort] = useState("");
  const [selectedPrice, setSelectedPrice] = useState("all");
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
    if (!categoriesReady) return;
    setLoading(true);
    const params: any = { current: 1, size: 100 };
    if (selectedCat !== "all") {
      const found = categoriesRef.current.find((c) => c.name === selectedCat);
      if (found) params.categoryId = found.id;
    }
    fetchGameList(params)
      .then((res: any) => {
        let list: GameItem[] = res?.list ?? res ?? [];
        // 价格筛选
        if (selectedPrice === "free") list = list.filter((g) => g.price === 0);
        if (selectedPrice === "paid") list = list.filter((g) => g.price > 0);
        if (selectedPrice === "member") list = list.filter((g) => g.memberPrice > 0 && g.memberPrice < g.price);
        // 排序
        if (selectedSort === "downloads") list = [...list].sort((a, b) => b.downloads - a.downloads);
        if (selectedSort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
        setGames(list);
      })
      .catch(() => setGames([]))
      .finally(() => setLoading(false));
  }, [selectedCat, selectedSort, selectedPrice, categoriesReady]);

  const handleCatChange = (name: string) => {
    setSelectedCat(name);
    router.push(`/category?cat=${encodeURIComponent(name)}`, { scroll: false });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-100">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-8 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-1">
              {selectedCat === "all" ? "全部游戏" : selectedCat}
            </h1>
            <p className="text-white/70 text-sm">
              {loading ? "加载中..." : `共 ${games.length} 款游戏`}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-4">
          {/* 分类导航 */}
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {/* 分类标签 */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => handleCatChange("all")}
                  className={`px-4 py-2 text-sm rounded-lg transition-all ${
                    selectedCat === "all" ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  全部游戏
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleCatChange(c.name)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                      selectedCat === c.name ? "bg-primary text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              {/* 价格和排序 */}
              <div className="flex flex-wrap items-center gap-4 text-sm border-t pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">价格：</span>
                  {PRICE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedPrice(opt.value)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                        selectedPrice === opt.value ? "bg-primary/10 text-primary font-medium" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">排序：</span>
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedSort(opt.value)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                        selectedSort === opt.value ? "bg-primary/10 text-primary font-medium" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 加载中 */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* 空状态 */}
          {!loading && games.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Gamepad2 className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">暂无游戏</h3>
                <p className="text-gray-400 text-sm">该分类暂无游戏，试试其他分类</p>
              </CardContent>
            </Card>
          )}

          {/* 游戏列表 */}
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

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
