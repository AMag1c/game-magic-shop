"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Gamepad2, Calendar, Eye, Star, Download,
  ChevronLeft, ChevronRight, Sparkles, Flame, Zap, X,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GameCard } from "@/components/game-card";
import { fetchGameList, fetchGameCategories, type GameItem, type GameCategory } from "@/lib/api";

const SITE_DYNAMICS = [
  { text: "白**王 签到打卡成功，获得奖励：1.0游戏币", time: "21 分钟前" },
  { text: "游**客 购买了 星际裂变，花费5游戏币", time: "35 分钟前" },
  { text: "暗**夜 成功开通永久会员", time: "1 小时前" },
  { text: "小**飞 下载了 软盘骑士", time: "2 小时前" },
  { text: "冰**凌 签到打卡成功，获得奖励：2.0游戏币", time: "3 小时前" },
];

function getGameImage(game: GameItem) {
  return game.coverImage || "/game-sample.jpg";
}

export default function HomePage() {
  const router = useRouter();
  const [games, setGames] = useState<GameItem[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const [dynamicIndex, setDynamicIndex] = useState(0);
  const tickerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetchGameList({ current: 1, size: 50 }),
      fetchGameCategories(),
    ])
      .then(([gameRes, catRes]) => {
        const gameData = gameRes as any;
        setGames(gameData?.list ?? gameData ?? []);
        setCategories((catRes as any) ?? []);
      })
      .catch(() => { setGames([]); setCategories([]); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const el = tickerRef.current;
      if (!el) return;
      el.style.transition = "transform 500ms ease-in-out";
      el.style.transform = "translateY(-50%)";
      const onEnd = () => {
        el.removeEventListener("transitionend", onEnd);
        el.style.transition = "none";
        setDynamicIndex((p) => (p + 1) % SITE_DYNAMICS.length);
        requestAnimationFrame(() => {
          el.style.transform = "translateY(0)";
        });
      };
      el.addEventListener("transitionend", onEnd);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  const featuredGame = games.find((g) => g.isFeatured);
  const sideGames = games.filter((g) => !g.isFeatured).slice(0, 8);
  const gridGames = games.filter((g) => !g.isFeatured);
  const filteredGames = selectedCategory === "all"
    ? gridGames
    : gridGames.filter((g) => g.category === selectedCategory);

  const handleScroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement;
    const amount = (first?.offsetWidth ?? 200) + 16;
    el.scrollTo({ left: el.scrollLeft + (dir === "left" ? -amount : amount), behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-6 space-y-6">
        {/* 公告 */}
        {showAnnouncement && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                  <p><span className="font-semibold text-blue-700">1. </span>所有游戏均为网络资源整合，购买后获取下载链接，如遇问题请提交工单。</p>
                  <p><span className="font-semibold text-blue-700">2. </span>新用户注册即可签到获取游戏币，每日签到可获得更多奖励。</p>
                  <p><span className="font-semibold text-blue-700">3. </span>VIP 会员享受专属折扣，全场游戏会员价购买。</p>
                </div>
                <button onClick={() => setShowAnnouncement(false)} className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 动态栏 */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                <Zap className="w-3 h-3" />网站动态
              </span>
              <div className="h-5 overflow-hidden">
                <div ref={tickerRef}>
                  <div className="flex items-center gap-2 h-5">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{SITE_DYNAMICS[dynamicIndex].text}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{SITE_DYNAMICS[dynamicIndex].time}</span>
                  </div>
                  <div className="flex items-center gap-2 h-5">
                    <span className="text-sm text-gray-600 whitespace-nowrap">{SITE_DYNAMICS[(dynamicIndex + 1) % SITE_DYNAMICS.length].text}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">{SITE_DYNAMICS[(dynamicIndex + 1) % SITE_DYNAMICS.length].time}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-500 flex-shrink-0">
              游戏总数 <span className="font-bold text-purple-600">{games.length}</span>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">加载中...</div>
        )}

        {!loading && (
          <>
            {/* 精选 + 侧边 */}
            {(featuredGame || sideGames.length > 0) && (
              <div className="grid lg:grid-cols-7 gap-4">
                {featuredGame && (
                  <div className="lg:col-span-3">
                    <div
                      className="group relative overflow-hidden rounded-xl cursor-pointer h-full min-h-[240px] bg-gray-200"
                      onClick={() => router.push(`/game/${featuredGame.id}`)}
                    >
                      <Image src={getGameImage(featuredGame)} alt={featuredGame.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <div className="absolute top-3 left-3">
                        <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />精选推荐
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h2 className="text-xl font-bold mb-2">{featuredGame.name}</h2>
                        <div className="flex items-center gap-3 text-sm opacity-90">
                          <span className="flex items-center gap-1"><Gamepad2 className="w-3.5 h-3.5" />{featuredGame.category}</span>
                          {featuredGame.releaseDate && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{featuredGame.releaseDate}</span>}
                          <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{featuredGame.views}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div className={`${featuredGame ? "lg:col-span-4" : "lg:col-span-7"} grid grid-cols-2 gap-3`}>
                  {sideGames.map((game) => (
                    <div
                      key={game.id}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer p-3"
                      onClick={() => router.push(`/game/${game.id}`)}
                    >
                      <div className="flex gap-3">
                        <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
                          <Image src={getGameImage(game)} alt={game.name} fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{game.name}</h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{game.category}</span>
                            {game.releaseDate && <span>{game.releaseDate}</span>}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{game.views}</span>
                            <span className="flex items-center gap-1"><Download className="w-3 h-3" />{game.downloads}</span>
                            <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{game.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 横向滚动推荐 */}
            {games.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Flame className="w-5 h-5 text-orange-500" />游戏推荐
                </h3>
                <div className="relative">
                  <button
                    onClick={() => handleScroll("left")}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-20 w-8 bg-white/90 hover:bg-white shadow-md rounded-lg flex items-center justify-center"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleScroll("right")}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 h-20 w-8 bg-white/90 hover:bg-white shadow-md rounded-lg flex items-center justify-center"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div
                    ref={scrollRef}
                    className="grid grid-flow-col auto-cols-[calc(25%-12px)] md:auto-cols-[calc(20%-13px)] gap-4 overflow-x-auto pb-4"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {games.map((game) => (
                      <GameCard key={game.id} game={game} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 分类 + 网格 */}
            <div>
              <div className="flex items-center gap-4 mb-4 flex-wrap">
                <h3 className="text-xl font-bold flex items-center gap-2 whitespace-nowrap">
                  <Sparkles className="w-5 h-5 text-yellow-500" />最新更新
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                        selectedCategory === cat.name
                          ? "bg-blue-600 text-white"
                          : "bg-white border hover:border-blue-400 hover:text-blue-600"
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                      selectedCategory === "all"
                        ? "bg-blue-600 text-white"
                        : "bg-white border hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    全部
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredGames.map((game) => (
                  <GameCard key={game.id} game={game} showPriceBadge />
                ))}
              </div>

              {filteredGames.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm flex flex-col items-center justify-center py-16">
                  <Gamepad2 className="w-12 h-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-gray-600">暂无游戏</h3>
                  <p className="text-gray-400 text-sm mb-4">
                    {selectedCategory === "all" ? "还没有上架任何游戏" : "该分类暂无游戏"}
                  </p>
                  {selectedCategory !== "all" && (
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      查看全部
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
