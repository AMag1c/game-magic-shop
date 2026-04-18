"use client";

import { Suspense, useMemo } from "react";
import { Search, Gamepad2 } from "lucide-react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { GameGrid } from "@/components/game-grid";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { useCategories } from "@/lib/hooks/use-categories";
import { useGames } from "@/lib/hooks/use-games";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import type { GameItem } from "@/lib/api";

function SearchContent() {
  const { filters, setFilter } = useUrlFilters();
  const { data: categories } = useCategories();

  const categoryId = useMemo(() => {
    if (filters.cat === "all" || !categories) return undefined;
    return categories.find((c) => c.name === filters.cat)?.id;
  }, [filters.cat, categories]);

  const { data, isLoading } = useGames(
    filters.q
      ? { keyword: filters.q, categoryId, current: 1, size: 50 }
      : {}
  );

  const filteredGames = useMemo(() => {
    let list: GameItem[] = data?.list ?? [];
    if (filters.sort === "downloads") list = [...list].sort((a, b) => b.downloads - a.downloads);
    else if (filters.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (filters.sort === "newest") list = [...list].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
    return list;
  }, [data, filters.sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-steam-text">
            {filters.q ? (
              <>搜索: <span className="text-steam-blue">{filters.q}</span></>
            ) : "搜索游戏"}
          </h1>
          {filters.q && !isLoading && (
            <p className="text-sm text-steam-text-dim mt-1">
              找到 {filteredGames.length} 个结果
            </p>
          )}
        </div>
        <div className="lg:hidden">
          <FilterSidebar
            selectedCat={filters.cat}
            selectedPrice="all"
            selectedSort={filters.sort}
            onCatChange={(v) => setFilter("cat", v)}
            onPriceChange={() => {}}
            onSortChange={(v) => setFilter("sort", v)}
          />
        </div>
      </div>

      {/* 无查询 - 显示热门分类 */}
      {!filters.q && (
        <div className="flex flex-col items-center justify-center py-20">
          <Search className="w-16 h-16 text-steam-text-dim/30 mb-4" />
          <h2 className="text-lg font-semibold text-steam-text-dim mb-2">按 Ctrl+K 搜索游戏</h2>
          <p className="text-sm text-steam-text-dim/70 mb-6">或浏览热门分类</p>
          <div className="flex flex-wrap gap-2 justify-center max-w-md">
            {categories?.map((cat) => (
              <Link key={cat.id} href={`/category?cat=${encodeURIComponent(cat.name)}`}>
                <Badge className="cursor-pointer bg-steam-light text-steam-text-dim hover:bg-steam-blue/20 hover:text-steam-blue border-0 transition-colors text-sm px-3 py-1 rounded-sm">
                  {cat.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 有查询 - 侧边栏 + 网格 */}
      {filters.q && (
        <div className="flex gap-6">
          <FilterSidebar
            selectedCat={filters.cat}
            selectedPrice="all"
            selectedSort={filters.sort}
            onCatChange={(v) => setFilter("cat", v)}
            onPriceChange={() => {}}
            onSortChange={(v) => setFilter("sort", v)}
          />
          <div className="flex-1 min-w-0">
            {!isLoading && filteredGames.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Gamepad2 className="w-12 h-12 text-steam-text-dim/50 mb-4" />
                <h3 className="text-lg font-semibold text-steam-text-dim mb-1">未找到相关游戏</h3>
                <p className="text-sm text-steam-text-dim/70">试试其他关键词或调整筛选条件</p>
              </div>
            ) : (
              <GameGrid
                games={filteredGames}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-steam-blue/30 border-t-steam-blue rounded-full animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
