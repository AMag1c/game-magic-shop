"use client";

import { useRouter } from "next/navigation";
import {
  Coins, Download, Lock, ExternalLink, Copy, CheckCircle, Crown,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/auth-context";
import { usePurchaseStatus } from "@/lib/hooks/use-game-detail";
import { usePurchaseGame } from "@/lib/hooks/use-purchase";
import type { GameItem, DownloadLink } from "@/lib/api";
import { toast } from "sonner";

const PLATFORM_COLORS: Record<string, string> = {
  "百度网盘": "bg-blue-500",
  "天翼云盘": "bg-sky-500",
  "迅雷云盘": "bg-yellow-500",
  "夸克网盘": "bg-orange-500",
  "正版购买": "bg-emerald-600",
};

function getPlatformColor(name: string) {
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (name.includes(k)) return v;
  }
  return "bg-primary";
}

interface StickyPurchaseCardProps {
  game: GameItem;
}

export function StickyPurchaseCard({ game }: StickyPurchaseCardProps) {
  const router = useRouter();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { data: status } = usePurchaseStatus(game.id, isLoggedIn);
  const purchaseMutation = usePurchaseGame();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const isPurchased = status?.purchased === true;
  const downloadLinks: DownloadLink[] = status?.downloadLinks ?? [];

  const handlePurchase = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    try {
      const result = await purchaseMutation.mutateAsync(game.id);
      toast.success(`购买成功! 消耗 ${result.coinsPaid} 游戏币`);
    } catch (err: any) {
      toast.error(err?.message || "购买失败");
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("已复制");
  };

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5 space-y-4 sticky top-20">
      {/* 价格区 */}
      {!isPurchased && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">普通价格</span>
              <span className="flex items-center gap-1 text-lg font-bold">
                <Coins className="w-4 h-4 text-vip" />
                {game.price === 0 ? "免费" : game.price}
              </span>
            </div>
            {game.memberPrice > 0 && game.memberPrice < game.price && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-vip" />
                  会员价
                </span>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-lg font-bold text-vip">
                    <Coins className="w-4 h-4" />
                    {game.memberPrice}
                  </span>
                  <span className="text-xs bg-destructive/20 text-destructive px-1.5 py-0.5 rounded">
                    {(game.memberPrice / game.price * 10).toFixed(1).replace(/\.0$/, "")}折
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {!isLoggedIn && !authLoading ? (
            <Button
              onClick={() => router.push("/auth/login")}
              className="w-full h-11 cursor-pointer"
              variant="outline"
            >
              <Lock className="w-4 h-4 mr-2" />
              登录后购买
            </Button>
          ) : (
            <Button
              onClick={handlePurchase}
              disabled={purchaseMutation.isPending}
              className="w-full h-11 cursor-pointer"
            >
              <Download className="w-4 h-4 mr-2" />
              {purchaseMutation.isPending ? "购买中..." : "立即购买"}
            </Button>
          )}
        </>
      )}

      {/* 已购买 */}
      {isPurchased && (
        <>
          <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-medium text-emerald-400">已购买</span>
          </div>

          {downloadLinks.length > 0 && (
            <div className="space-y-2">
              {downloadLinks.map((link, i) => (
                <div key={i} className="space-y-1">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center justify-center gap-2 w-full h-9 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity",
                      getPlatformColor(link.name)
                    )}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />{link.name}
                  </a>
                  {link.password && (
                    <div className="flex items-center justify-between px-3 py-1.5 bg-muted rounded text-xs">
                      <span className="text-muted-foreground">
                        提取码: <span className="font-mono text-foreground">{link.password}</span>
                      </span>
                      <button
                        onClick={() => handleCopy(link.password!, i)}
                        className="text-primary hover:text-primary/80 cursor-pointer"
                      >
                        {copiedIndex === i ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {status?.activationCode && (
            <div className="flex items-center justify-between p-2.5 bg-muted rounded-lg text-sm">
              <span className="text-muted-foreground">激活码</span>
              <span className="font-medium text-primary">{status.activationCode}</span>
            </div>
          )}
        </>
      )}

      <Separator />

      {/* 统计 */}
      <div className="grid grid-cols-2 gap-3 text-center text-sm">
        <div className="bg-muted rounded-lg p-2">
          <div className="text-muted-foreground text-xs">下载量</div>
          <div className="font-bold">{game.downloads}</div>
        </div>
        <div className="bg-muted rounded-lg p-2">
          <div className="text-muted-foreground text-xs">浏览量</div>
          <div className="font-bold">{game.views}</div>
        </div>
      </div>
    </div>
  );
}
