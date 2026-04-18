"use client";

import { Suspense, useMemo, useState, useCallback } from "react";
import { Gamepad2 } from "lucide-react";
import { FilterSidebar } from "@/components/filter-sidebar";
import { GameGrid } from "@/components/game-grid";
import { useUrlFilters } from "@/lib/hooks/use-url-filters";
import { useCategories } from "@/lib/hooks/use-categories";
import { useGames } from "@/lib/hooks/use-games";
import type { GameItem } from "@/lib/api";

function CategoryContent() {
  const { filters, setFilter } = useUrlFilters();
  const { data: categories } = useCategories();
  const [pageSize] = useState(20);

  // 查找分类 ID
  const categoryId = useMemo(() => {
    if (filters.cat === "all" || !categories) return undefined;
    return categories.find((c) => c.name === filters.cat)?.id;
  }, [filters.cat, categories]);

  const { data, isLoading } = useGames({
    categoryId,
    current: 1,
    size: pageSize * filters.page,
  });

  // 客户端筛选价格和排序
  const filteredGames = useMemo(() => {
    let list: GameItem[] = data?.list ?? [];

    if (filters.price === "free") list = list.filter((g) => g.price === 0);
    else if (filters.price === "paid") list = list.filter((g) => g.price > 0);
    else if (filters.price === "member") list = list.filter((g) => g.memberPrice > 0 && g.memberPrice < g.price);

    if (filters.sort === "downloads") list = [...list].sort((a, b) => b.downloads - a.downloads);
    else if (filters.sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (filters.sort === "newest") list = [...list].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

    return list;
  }, [data, filters.price, filters.sort]);

  const total = data?.total ?? 0;
  const hasMore = filteredGames.length < total;

  const handleLoadMore = useCallback(() => {
    setFilter("page", filters.page + 1);
  }, [filters.page, setFilter]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
      {/* 页头 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-steam-text">
            {filters.cat === "all" ? "全部游戏" : filters.cat}
          </h1>
          <p className="text-sm text-steam-text-dim mt-1">
            {isLoading ? "加载中..." : `共 ${filteredGames.length} 款游戏`}
          </p>
        </div>
        {/* 移动端筛选按钮 */}
        <div className="lg:hidden">
          <FilterSidebar
            selectedCat={filters.cat}
            selectedPrice={filters.price}
            selectedSort={filters.sort}
            onCatChange={(v) => setFilter("cat", v)}
            onPriceChange={(v) => setFilter("price", v)}
            onSortChange={(v) => setFilter("sort", v)}
          />
        </div>
      </div>

      <div className="flex gap-6">
        {/* 桌面端侧边栏 */}
        <FilterSidebar
          selectedCat={filters.cat}
          selectedPrice={filters.price}
          selectedSort={filters.sort}
          onCatChange={(v) => setFilter("cat", v)}
          onPriceChange={(v) => setFilter("price", v)}
          onSortChange={(v) => setFilter("sort", v)}
        />

        {/* 游戏网格 */}
        <div className="flex-1 min-w-0">
          {!isLoading && filteredGames.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Gamepad2 className="w-12 h-12 text-steam-text-dim/50 mb-4" />
              <h3 className="text-lg font-semibold text-steam-text-dim mb-1">暂无游戏</h3>
              <p className="text-sm text-steam-text-dim/70">试试调整筛选条件</p>
            </div>
          ) : (
            <GameGrid
              games={filteredGames}
              total={total}
              isLoading={isLoading}
              hasMore={hasMore}
              onLoadMore={handleLoadMore}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default function CategoryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-steam-blue/30 border-t-steam-blue rounded-full animate-spin" />
      </div>
    }>
      <CategoryContent />
    </Suspense>
  );
}
