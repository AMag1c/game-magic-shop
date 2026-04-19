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
      <section className="px-4 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto space-y-2">
          <SiteAnnouncement />
          <SiteDynamic />
        </div>
      </section>

      {/* 精选轮播 */}
      <section className="px-4 md:px-8 py-4">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-sm font-medium text-steam-text uppercase tracking-wide mb-2">精选和推荐</h2>
          <HeroCarousel games={heroGames} isLoading={isLoading} />
        </div>
      </section>

      {/* 折扣与活动 */}
      <section className="px-4 md:px-8 py-6">
        <div className="max-w-[1100px] mx-auto">
          <SpecialOffers games={games} isLoading={isLoading} />
        </div>
      </section>

      {/* 浏览商城 */}
      <section className="px-4 md:px-8 py-6">
        <div className="max-w-[1100px] mx-auto">
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
      </section>

      {/* 最新上架 */}
      <section className="px-4 md:px-8 py-6">
        <div className="max-w-[1100px] mx-auto">
          <GameRow
            title="最新上架"
            games={newestGames}
            viewAllHref="/category?sort=newest"
            isLoading={isLoading}
          />
        </div>
      </section>

      {/* Tab 风格游戏列表 - 内容区通栏渐变 */}
      <section className="py-6">
        <HomeTabs games={games} isLoading={isLoading} />
      </section>

      {/* 会员特惠 */}
      {memberDeals.length > 0 && (
        <section className="px-4 md:px-8 py-6">
          <div className="max-w-[1100px] mx-auto">
            <GameRow
              title="会员特惠"
              games={memberDeals}
              viewAllHref="/category?price=member"
              isLoading={isLoading}
            />
          </div>
        </section>
      )}
    </div>
  );
}
