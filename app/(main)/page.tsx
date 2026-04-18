"use client";

import { useMemo } from "react";
import { HeroCarousel } from "@/components/hero-carousel";
import { SiteAnnouncement } from "@/components/site-announcement";
import { SiteDynamic } from "@/components/site-dynamic";
import { SpecialOffers } from "@/components/special-offers";
import { HomeTabs } from "@/components/home-tabs";
import { GameRow } from "@/components/game-row";
import { useAllGames } from "@/lib/hooks/use-games";
import Link from "next/link";

export default function HomePage() {
  const { data: gamesData, isLoading } = useAllGames(100);
  const games = gamesData?.list ?? [];

  const heroGames = useMemo(() => {
    const featured = games.filter((g) => g.isFeatured);
    if (featured.length >= 3) return featured.slice(0, 5);
    return [...games].sort((a, b) => b.downloads - a.downloads).slice(0, 5);
  }, [games]);

  const newestGames = useMemo(
    () => [...games].sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime()).slice(0, 12),
    [games]
  );

  const memberDeals = useMemo(
    () => games.filter((g) => g.memberPrice > 0 && g.memberPrice < g.price).slice(0, 12),
    [games]
  );

  return (
    <div>
      {/* 公告 + 动态 */}
      <div className="max-w-[1280px] mx-auto px-[48px] pt-4 space-y-2">
        <SiteAnnouncement />
        <SiteDynamic />
      </div>

      {/* 精选轮播 */}
      <div className="max-w-[1280px] mx-auto px-[48px] pt-4">
        <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide mb-2">精选和推荐</h2>
        <HeroCarousel games={heroGames} isLoading={isLoading} />
      </div>

      {/* 折扣与活动 */}
      <div className="max-w-[1280px] mx-auto px-[48px] pt-6">
        <SpecialOffers games={games} isLoading={isLoading} />
      </div>

      {/* 浏览 Steam 风格导航按钮 */}
      <div className="max-w-[1280px] mx-auto px-[48px] pt-6">
        <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide mb-2">浏览商城</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Link
            href="/category?sort=newest"
            className="flex items-center justify-center py-3 bg-steam-medium hover:bg-steam-light/60 rounded text-sm text-steam-text font-medium transition-colors cursor-pointer"
          >
            新品
          </Link>
          <Link
            href="/category?sort=discount"
            className="flex items-center justify-center py-3 bg-steam-medium hover:bg-steam-light/60 rounded text-sm text-steam-text font-medium transition-colors cursor-pointer"
          >
            优惠
          </Link>
          <Link
            href="/category?price=free"
            className="flex items-center justify-center py-3 bg-steam-medium hover:bg-steam-light/60 rounded text-sm text-steam-text font-medium transition-colors cursor-pointer"
          >
            免费游戏
          </Link>
          <Link
            href="/category"
            className="flex items-center justify-center py-3 bg-steam-medium hover:bg-steam-light/60 rounded text-sm text-steam-text font-medium transition-colors cursor-pointer"
          >
            按分类浏览
          </Link>
        </div>
      </div>

      {/* 最新上架 */}
      <div className="max-w-[1200px] mx-auto px-4 py-4">
        <GameRow
          title="最新上架"
          games={newestGames}
          viewAllHref="/category?sort=newest"
          isLoading={isLoading}
        />
      </div>

      {/* Tab 风格游戏列表 - 新品/热销/即将推出/优惠/免费 - 带 Steam 风格渐变背景 */}
      <div className="bg-gradient-to-b from-black/30 via-[#2a475e]/20 to-[#2a475e]/30 py-6">
        <div className="max-w-[1200px] mx-auto px-4">
          <HomeTabs games={games} isLoading={isLoading} />
        </div>
      </div>

      {/* 会员特惠 */}
      {memberDeals.length > 0 && (
        <div className="max-w-[1200px] mx-auto px-4 py-4">
          <GameRow
            title="会员特惠"
            games={memberDeals}
            viewAllHref="/category?price=member"
            isLoading={isLoading}
          />
        </div>
      )}
    </div>
  );
}
