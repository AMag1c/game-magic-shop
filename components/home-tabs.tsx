"use client";

import { Fragment, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import type { GameItem } from "@/lib/api";

interface HomeTabsProps {
  games: GameItem[];
  isLoading?: boolean;
}

type TabKey = "newest" | "topsellers" | "specials" | "free" | "trendingfree";

const TABS: { key: TabKey; label: string; viewAllHref: string; viewAllLabel: string }[] = [
  { key: "newest", label: "人气蹿升的新品", viewAllHref: "/category?sort=newest", viewAllLabel: "新品" },
  { key: "topsellers", label: "热销游戏", viewAllHref: "/category?sort=downloads", viewAllLabel: "热销游戏" },
  { key: "specials", label: "优惠", viewAllHref: "/category?sort=discount", viewAllLabel: "优惠" },
  { key: "free", label: "免费游戏", viewAllHref: "/category?price=free", viewAllLabel: "免费游戏" },
  { key: "trendingfree", label: "人气蹿升的免费游戏", viewAllHref: "/category?price=free&sort=trending", viewAllLabel: "免费开玩游戏" },
];

function getImg(g: GameItem) {
  return g.coverImage || "/game-sample.jpg";
}

function getDiscount(g: GameItem) {
  if (!g.originalPrice || g.originalPrice <= g.price) return 0;
  return Math.round((1 - g.price / g.originalPrice) * 100);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`;
}

function DiscountBlock({ game, selected }: { game: GameItem; selected?: boolean }) {
  const pct = getDiscount(game);
  if (game.price === 0) {
    return (
      <span className={cn("text-[16px] font-medium", selected ? "text-black" : "text-steam-blue")}>免费</span>
    );
  }
  if (pct > 0) {
    return (
      <div className="flex items-stretch w-[110px] h-[30px]">
        {/* 绿色折扣标 - 固定 46px，左 */}
        <div className="bg-steam-green text-steam-sale text-[15px] font-bold w-[46px] flex items-center justify-center whitespace-nowrap">
          -{pct}%
        </div>
        {/* 价格块 - 撑满剩余 64px，内部右对齐 */}
        <div className="flex-1 flex flex-col items-end justify-center gap-[1px]">
          {/* 原价：划掉、灰色 */}
          <div className="text-[12px] leading-none text-steam-text-dim line-through whitespace-nowrap inline-flex items-center gap-0.5">
            {game.originalPrice}
            <Coins className="w-3 h-3" />
          </div>
          {/* 现价：selected 时黑色，否则黄绿色 */}
          <div className={cn(
            "text-[16px] leading-none font-medium whitespace-nowrap inline-flex items-center gap-0.5",
            selected ? "text-black" : "text-steam-sale"
          )}>
            {game.price}
            <Coins className="w-4 h-4" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <span className={cn(
      "text-[16px] font-medium inline-flex items-center gap-0.5",
      selected ? "text-black" : "text-white"
    )}>
      {game.price}
      <Coins className="w-4 h-4" />
    </span>
  );
}

function TabItemRow({
  game,
  selected,
  onHover,
}: {
  game: GameItem;
  selected: boolean;
  onHover: () => void;
}) {
  const tagList = (game.tags ?? []).slice(0, 4);
  return (
    <Link
      href={`/game/${game.id}`}
      onMouseEnter={onHover}
      onFocus={onHover}
      className={cn(
        "flex h-[96px] overflow-hidden transition-colors cursor-pointer group mb-1"
      )}
    >
      {/* 封面：宽 184px,高度随卡片铺满 */}
      <div className="relative w-[184px] h-full flex-shrink-0 bg-steam-dark">
        <Image
          src={getImg(game)}
          alt={game.name}
          fill
          className="object-cover"
          sizes="184px"
        />
      </div>

      {/* 右侧内容:紧凑内边距,撑满卡片高度 */}
      <div className={cn(
        "flex-1 min-w-0 flex gap-2 px-3 py-2 transition-colors",
        selected ? "bg-[#c7d5e0]" : "bg-steam-medium"
      )}>
        {/* 中列:游戏名 / 平台 / 标签 紧密堆叠,整体垂直居中 */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
          <div className={cn(
            "text-[15px] leading-tight font-medium truncate transition-colors",
            selected ? "text-black" : "text-steam-text group-hover:text-white"
          )}>
            {game.name}
          </div>
          <svg className="w-4 h-4 text-steam-text-dim" viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
          </svg>
          {tagList.length > 0 && (
            <div className="text-[13px] leading-tight text-steam-text-dim truncate">
              {tagList.join(", ")}
            </div>
          )}
        </div>

        {/* 右列:价格在除日期外的剩余空间内居中,日期贴右下 */}
        <div className="flex-shrink-0 w-[120px] flex flex-col items-end">
          <div className="flex-1 flex items-center">
            <DiscountBlock game={game} selected={selected} />
          </div>
          {game.releaseDate && (
            <div className="text-[11px] leading-tight text-steam-text-dim whitespace-nowrap">
              {formatDate(game.releaseDate)}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

function getReviewLabel(rating: number): { label: string; cls: string } {
  if (rating >= 4.5) return { label: "好评如潮", cls: "text-steam-blue" };
  if (rating >= 4) return { label: "特别好评", cls: "text-steam-blue" };
  if (rating >= 3) return { label: "多半好评", cls: "text-steam-blue" };
  if (rating >= 2) return { label: "褒贬不一", cls: "text-yellow-500" };
  if (rating > 0) return { label: "差评", cls: "text-red-500" };
  return { label: "暂无评价", cls: "text-steam-text-dim" };
}

function RightPreview({ game }: { game: GameItem }) {
  const raw = game.screenshots ?? [];
  const screenshots = raw.length > 0 ? raw.slice(0, 4) : [getImg(game)];
  const review = getReviewLabel(game.rating);

  return (
    <div className="h-full flex flex-col p-3 gap-2">
      {/* 游戏名 */}
      <h3 className="text-lg font-bold text-white truncate shrink-0">{game.name}</h3>

      {/* 评测摘要:总体用户评测 + 评价文字(带色) + 评价数 */}
      <div className="flex items-center gap-1.5 text-[12px] shrink-0">
        <span className="text-steam-text">总体用户评测:</span>
        <span className={cn("font-medium", review.cls)}>{review.label}</span>
        <span className="text-steam-text-dim">({game.likes})</span>
      </div>

      {/* 标签:纯文字链接,逗号分隔(Steam 原型同款) */}
      {game.tags && game.tags.length > 0 && (
        <div className="text-[12px] shrink-0 leading-relaxed">
          {game.tags.slice(0, 5).map((tag, i) => (
            <Fragment key={tag}>
              {i > 0 && <span className="text-steam-text-dim">, </span>}
              <Link
                href={`/category?tag=${encodeURIComponent(tag)}`}
                className="text-steam-text hover:text-white"
              >
                {tag}
              </Link>
            </Fragment>
          ))}
        </div>
      )}

      {/* 截图:flex-1 撑满剩余,最多 4 张均分高度 */}
      <div className="flex-1 flex flex-col gap-1 min-h-0">
        {screenshots.map((ss, i) => (
          <div key={i} className="flex-1 relative rounded-sm overflow-hidden bg-steam-dark/60 min-h-0">
            <Image src={ss} alt="" fill className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomeTabs({ games, isLoading }: HomeTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("newest");
  const [previewId, setPreviewId] = useState<number | null>(null);

  // 按 tab 筛选游戏
  const tabGames = useMemo(() => {
    const filterByTab = (key: TabKey): GameItem[] => {
      switch (key) {
        case "newest":
          return [...games]
            .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
            .slice(0, 10);
        case "topsellers":
          return [...games]
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10);
        case "specials":
          return [...games]
            .filter((g) => g.originalPrice && g.originalPrice > g.price)
            .sort((a, b) => getDiscount(b) - getDiscount(a))
            .slice(0, 10);
        case "free":
          return games
            .filter((g) => g.price === 0)
            .sort((a, b) => b.downloads - a.downloads)
            .slice(0, 10);
        case "trendingfree":
          return games
            .filter((g) => g.price === 0)
            .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
            .slice(0, 10);
      }
    };
    return filterByTab(activeTab);
  }, [activeTab, games]);

  // 当前预览的游戏（默认是列表第一个）
  const previewGame = useMemo(() => {
    if (previewId != null) {
      const found = games.find((g) => g.id === previewId);
      if (found) return found;
    }
    return tabGames[0];
  }, [previewId, tabGames, games]);

  const activeTabInfo = TABS.find((t) => t.key === activeTab)!;

  if (isLoading) {
    return (
      <div className="max-w-[1100px] mx-auto">
        <div className="flex gap-1 mb-3">
          {TABS.map((t) => <Skeleton key={t.key} className="h-8 w-28" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-2">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[85px] rounded" />)}
          </div>
          <Skeleton className="aspect-[3/4] rounded" />
        </div>
      </div>
    );
  }

  if (games.length === 0) return null;

  return (
    <div>
      {/* Tab 导航：居中限宽 */}
      <div className="max-w-[1100px] mx-auto">
        <div className="flex flex-wrap gap-px mb-0">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              role="tab"
              aria-selected={activeTab === tab.key}
              onClick={() => {
                setActiveTab(tab.key);
                setPreviewId(null);
              }}
              className={cn(
                "px-4 py-2 text-[13px] font-medium transition-colors cursor-pointer",
                activeTab === tab.key
                  ? "bg-steam-light/70 text-white rounded-t"
                  : "text-steam-text-dim hover:text-steam-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 内容区：通栏渐变，内层限宽居中 */}
      <div className="bg-gradient-to-b from-[#2a475e]/70 via-[#1b2838]/90 via-50% to-[#1b2838]/90 pt-2 pb-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3">
          {/* 左侧列表 */}
          <div className="lg:col-span-2">
            {tabGames.length > 0 ? (
              <>
                <div className="space-y-1">
                  {tabGames.map((game) => (
                    <TabItemRow
                      key={game.id}
                      game={game}
                      selected={previewGame?.id === game.id}
                      onHover={() => setPreviewId(game.id)}
                    />
                  ))}
                </div>

                {/* 查看更多 */}
                <div className="flex items-center justify-end gap-2 p-2">
                  <span className="text-[11px] text-steam-text-dim">查看更多:</span>
                  <Link
                    href={activeTabInfo.viewAllHref}
                    className="text-[11px] px-3 py-1 bg-steam-light/40 hover:bg-steam-light/70 text-steam-text rounded transition-colors cursor-pointer"
                  >
                    {activeTabInfo.viewAllLabel}
                  </Link>
                </div>
              </>
            ) : (
              <div className="py-12 text-center text-steam-text-dim text-sm">
                暂无相关游戏
              </div>
            )}
          </div>

          {/* 右侧预览:整列使用选中色背景,让选中卡片的高亮视觉延伸过来 */}
          <div className="hidden lg:block bg-steam-light/70">
            {previewGame && <RightPreview game={previewGame} />}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
