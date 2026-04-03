"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2, Grid3x3, LayoutList, Star, Download, Gamepad2 } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { GameCard } from "@/components/game-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/contexts/auth-context";
import { fetchFavorites, fetchRemoveFavorite, type GameItem } from "@/lib/api";
import { toast } from "sonner";

export default function FavoritesPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetchFavorites()
      .then((res: any) => {
        setFavorites(res?.list ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const handleRemove = async (id: number) => {
    try {
      await fetchRemoveFavorite(id);
      setFavorites((prev) => prev.filter((g) => g.id !== id));
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      toast.success("已取消收藏");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleBatchRemove = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => fetchRemoveFavorite(id)));
      setFavorites((prev) => prev.filter((g) => !selectedIds.includes(g.id)));
      setSelectedIds([]);
      toast.success("批量取消收藏成功");
    } catch {
      toast.error("操作失败");
    }
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === favorites.length && favorites.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(favorites.map((g) => g.id));
    }
  };

  if (!isLoggedIn && !loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-100">
          <Heart className="w-16 h-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600">请先登录</h2>
          <p className="text-gray-400 text-sm">登录后即可查看收藏的游戏</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            去登录
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-100">
        {/* Banner */}
        <div className="bg-gradient-to-r from-primary to-primary/80 py-8 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">我的收藏</h1>
                <p className="text-white/70 text-sm">
                  共收藏了 {loading ? "..." : favorites.length} 款游戏
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
              >
                <LayoutList className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* 批量操作栏 */}
          {favorites.length > 0 && (
            <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedIds.length === favorites.length && favorites.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm text-muted-foreground">
                  {selectedIds.length > 0 ? `已选 ${selectedIds.length} 项` : "全选"}
                </span>
              </div>
              {selectedIds.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBatchRemove}
                  className="flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  取消收藏 ({selectedIds.length})
                </Button>
              )}
            </div>
          )}

          {/* 加载中 */}
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          )}

          {/* 空状态 */}
          {!loading && favorites.length === 0 && (
            <Card className="border-0 shadow-sm">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <Gamepad2 className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-600">暂无收藏</h3>
                <p className="text-gray-400 text-sm mb-4">快去发现你喜欢的游戏吧</p>
                <Button onClick={() => router.push("/category")}>浏览游戏</Button>
              </CardContent>
            </Card>
          )}

          {/* 游戏列表 - 网格模式 */}
          {!loading && favorites.length > 0 && viewMode === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favorites.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  selectable
                  selected={selectedIds.includes(game.id)}
                  onSelect={handleToggleSelect}
                  onRemove={handleRemove}
                />
              ))}
            </div>
          )}

          {/* 游戏列表 - 列表模式 */}
          {!loading && favorites.length > 0 && viewMode === "list" && (
            <div className="space-y-3">
              {favorites.map((game) => (
                <Card
                  key={game.id}
                  className={`border-0 shadow-sm hover:shadow-md transition-all ${
                    selectedIds.includes(game.id) ? "ring-2 ring-primary" : ""
                  }`}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div
                      onClick={(e) => { e.stopPropagation(); handleToggleSelect(game.id); }}
                      className="flex-shrink-0"
                    >
                      <Checkbox checked={selectedIds.includes(game.id)} />
                    </div>
                    <div
                      className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => router.push(`/game/${game.id}`)}
                    >
                      <Image
                        src={game.coverImage || "/game-sample.jpg"}
                        alt={game.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <Link href={`/game/${game.id}`}>
                            <h3 className="font-semibold hover:text-primary transition-colors line-clamp-1">
                              {game.name}
                            </h3>
                          </Link>
                          {game.nameEn && (
                            <p className="text-xs text-muted-foreground">{game.nameEn}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="flex-shrink-0 text-xs">{game.category}</Badge>
                      </div>
                      {game.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{game.description}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {game.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          {game.downloads}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemove(game.id)}
                      className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0 p-2"
                      title="取消收藏"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
