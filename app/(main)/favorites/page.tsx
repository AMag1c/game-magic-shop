"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Heart, Trash2, ArrowDownUp, Gamepad2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { GameCardNew } from "@/components/game-card-new";
import { SkeletonCard } from "@/components/skeleton-card";
import { useAuth } from "@/contexts/auth-context";
import { useFavorites, useRemoveFavorite } from "@/lib/hooks/use-favorites";
import { toast } from "sonner";
import type { GameItem } from "@/lib/api";

type SortKey = "time" | "name" | "rating";

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: "time", label: "收藏时间" },
  { key: "name", label: "名称 A-Z" },
  { key: "rating", label: "评分最高" },
];

function sortGames(games: GameItem[], key: SortKey): GameItem[] {
  const sorted = [...games];
  switch (key) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name, "zh-CN"));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    case "time":
    default:
      return sorted; // 后端默认按收藏时间倒序
  }
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { data: favorites = [], isLoading } = useFavorites(isLoggedIn);
  const removeMutation = useRemoveFavorite();

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortKey, setSortKey] = useState<SortKey>("time");
  const [removingIds, setRemovingIds] = useState<number[]>([]);

  const sortedGames = useMemo(() => sortGames(favorites, sortKey), [favorites, sortKey]);

  // -- 选择逻辑 --
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

  // -- 删除逻辑 --
  const handleRemove = async (id: number) => {
    setRemovingIds((prev) => [...prev, id]);
    try {
      await removeMutation.mutateAsync(id);
      setSelectedIds((prev) => prev.filter((i) => i !== id));
      toast.success("已取消收藏");
    } catch {
      toast.error("操作失败");
    } finally {
      setRemovingIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleBatchRemove = async () => {
    if (selectedIds.length === 0) return;
    const ids = [...selectedIds];
    setRemovingIds(ids);
    try {
      await Promise.all(ids.map((id) => removeMutation.mutateAsync(id)));
      setSelectedIds([]);
      toast.success("批量取消收藏成功");
    } catch {
      toast.error("操作失败");
    } finally {
      setRemovingIds([]);
    }
  };

  // -- 未登录 --
  if (!authLoading && !isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-20 h-20 rounded-sm bg-steam-medium flex items-center justify-center">
          <Heart className="w-10 h-10 text-steam-text-dim/50" />
        </div>
        <h2 className="text-xl font-semibold text-steam-text-dim">请先登录</h2>
        <p className="text-steam-text-dim/70 text-sm">登录后即可查看收藏的游戏</p>
        <Button
          onClick={() => router.push("/auth/login")}
          className="bg-steam-blue text-steam-dark hover:bg-steam-blue-hover rounded-sm"
        >
          去登录
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      {/* 标题行 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-steam-text">我的收藏</h1>
          {!isLoading && (
            <span className="text-sm text-steam-text-dim">
              ({favorites.length})
            </span>
          )}
        </div>

        {favorites.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 bg-steam-medium border-steam-light text-steam-text hover:bg-steam-light rounded-sm"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                {SORT_OPTIONS.find((o) => o.key === sortKey)?.label}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-steam-medium border-steam-light">
              {SORT_OPTIONS.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setSortKey(opt.key)}
                  className="gap-2 text-steam-text hover:!bg-steam-light hover:!text-steam-blue"
                >
                  {sortKey === opt.key && <Check className="w-3.5 h-3.5 text-steam-blue" />}
                  {sortKey !== opt.key && <span className="w-3.5" />}
                  {opt.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* 批量操作栏 */}
      {favorites.length > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-steam-light/30 rounded-sm border border-steam-light/20">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={
                selectedIds.length === favorites.length && favorites.length > 0
              }
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-steam-text-dim">
              {selectedIds.length > 0
                ? `已选 ${selectedIds.length} 项`
                : "全选"}
            </span>
          </div>
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBatchRemove}
              className="gap-1.5 rounded-sm"
            >
              <Trash2 className="w-4 h-4" />
              取消收藏 ({selectedIds.length})
            </Button>
          )}
        </div>
      )}

      {/* 加载骨架屏 - 使用 capsule (横向列表风格) */}
      {(isLoading || authLoading) && (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} variant="landscape" className="h-[90px]" />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {!isLoading && !authLoading && favorites.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-20 h-20 rounded-sm bg-steam-medium flex items-center justify-center mb-4">
            <Gamepad2 className="w-10 h-10 text-steam-text-dim/50" />
          </div>
          <h3 className="text-lg font-semibold mb-2 text-steam-text-dim">
            暂无收藏
          </h3>
          <p className="text-steam-text-dim/70 text-sm mb-4">
            快去发现你喜欢的游戏吧
          </p>
          <Button
            onClick={() => router.push("/category")}
            className="bg-steam-blue text-steam-dark hover:bg-steam-blue-hover rounded-sm"
          >
            去浏览
          </Button>
        </div>
      )}

      {/* 游戏列表 - 使用 capsule 变体 (Steam 收藏库风格) */}
      {!isLoading && !authLoading && favorites.length > 0 && (
        <div className="space-y-2">
          <AnimatePresence mode="popLayout">
            {sortedGames.map((game) => (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 1, scale: 1 }}
                animate={
                  removingIds.includes(game.id)
                    ? { opacity: 0, scale: 0.95 }
                    : { opacity: 1, scale: 1 }
                }
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="relative group"
              >
                {/* 选择 checkbox */}
                <div
                  className="absolute top-2 left-2 z-20 cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleToggleSelect(game.id);
                  }}
                >
                  <div
                    className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-colors ${
                      selectedIds.includes(game.id)
                        ? "bg-steam-blue border-steam-blue"
                        : "bg-black/40 border-white/50 hover:border-white"
                    }`}
                  >
                    {selectedIds.includes(game.id) && (
                      <Check className="w-3.5 h-3.5 text-steam-dark" />
                    )}
                  </div>
                </div>

                {/* 删除按钮 */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRemove(game.id);
                  }}
                  className="absolute top-2 right-2 z-20 w-7 h-7 rounded-sm bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                  title="取消收藏"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white" />
                </button>

                <GameCardNew game={game} variant="capsule" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
