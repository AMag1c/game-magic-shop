"use client";

import { useRouter } from "next/navigation";
import {
  Crown,
  Coins,
  Check,
  Zap,
  Sparkles,
  Shield,
  Gift,
  CalendarCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useVipStatus, useVipSubscribe } from "@/lib/hooks/use-vip";
import type { VipPlan } from "@/lib/api";
import { toast } from "sonner";

// -- 套餐数据 --
interface PlanInfo {
  id: VipPlan;
  name: string;
  price: number;
  days: number;
  dailyPrice: string; // 每日均价
  savePct: number; // 省百分比，0 表示不显示
  isRecommended: boolean;
}

const PLANS: PlanInfo[] = [
  {
    id: "monthly",
    name: "月度会员",
    price: 500,
    days: 30,
    dailyPrice: "16.7",
    savePct: 0,
    isRecommended: false,
  },
  {
    id: "quarterly",
    name: "季度会员",
    price: 1200,
    days: 90,
    dailyPrice: "13.3",
    savePct: 20,
    isRecommended: true,
  },
  {
    id: "yearly",
    name: "年度会员",
    price: 3600,
    days: 365,
    dailyPrice: "9.9",
    savePct: 41,
    isRecommended: false,
  },
];

// -- 对比表行 --
interface FeatureRow {
  label: string;
  monthly: boolean;
  quarterly: boolean;
  yearly: boolean;
}

const FEATURE_ROWS: FeatureRow[] = [
  { label: "签到加成", monthly: true, quarterly: true, yearly: true },
  { label: "会员价格", monthly: true, quarterly: true, yearly: true },
  { label: "专属标识", monthly: true, quarterly: true, yearly: true },
  { label: "优先客服", monthly: false, quarterly: true, yearly: true },
  { label: "专属礼包", monthly: false, quarterly: false, yearly: true },
];

export default function VipPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading, refreshProfile } = useAuth();
  const { data: vipStatus, isLoading: vipLoading } = useVipStatus(isLoggedIn);
  const subscribeMutation = useVipSubscribe();

  const loading = authLoading || vipLoading;

  const handlePurchase = async (plan: PlanInfo) => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if ((user?.gameCoins ?? 0) < plan.price) {
      toast.error(
        `游戏币不足，需要 ${plan.price} 游戏币，当前余额 ${user?.gameCoins ?? 0}`
      );
      return;
    }
    try {
      await subscribeMutation.mutateAsync(plan.id);
      toast.success("VIP 开通成功!");
      refreshProfile();
    } catch (err: any) {
      toast.error(err?.message || "开通失败，请重试");
    }
  };

  // -- 加载中 --
  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 w-full" />
        <div className="max-w-5xl mx-auto px-4 space-y-6">
          <Skeleton className="h-20 w-full rounded-sm" />
          <Skeleton className="h-96 w-full rounded-sm" />
        </div>
      </div>
    );
  }

  // -- 未登录 --
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-20 h-20 rounded-sm bg-vip/10 flex items-center justify-center">
          <Crown className="w-10 h-10 text-vip" />
        </div>
        <h2 className="text-xl font-semibold text-steam-text-dim">请先登录</h2>
        <p className="text-steam-text-dim/70 text-sm">登录后即可开通 VIP 会员</p>
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
    <>
      {/* ====== 顶部 Banner - 金色渐变 ====== */}
      <div className="bg-gradient-to-r from-vip to-vip-dark py-10 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Crown className="w-8 h-8 text-white" />
            <h1 className="text-3xl font-bold text-white">VIP 会员中心</h1>
          </div>
          <p className="text-white/80 text-sm">
            使用游戏币开通 VIP，享受专属特权
          </p>
          {vipStatus?.isVip && (
            <div className="mt-4">
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 px-3 py-1 rounded-sm">
                <Crown className="w-3.5 h-3.5 mr-1.5" />
                VIP 会员
                {vipStatus.expireAt &&
                  ` -- 到期 ${vipStatus.expireAt.slice(0, 10)}`}
              </Badge>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
        {/* ====== 余额卡片 ====== */}
        <Card className="border border-steam-light/30 bg-steam-medium rounded-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-sm bg-vip/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-vip" />
              </div>
              <div>
                <p className="text-sm text-steam-text-dim">当前游戏币余额</p>
                <p className="text-2xl font-bold text-vip">
                  {user?.gameCoins ?? 0}
                </p>
              </div>
            </div>
            <div className="text-right text-sm text-steam-text-dim">
              <p>每日签到可获得游戏币</p>
              <p>VIP 签到额外 +50%</p>
            </div>
          </CardContent>
        </Card>

        {/* ====== 功能对比表 ====== */}
        <div>
          <h2 className="text-lg font-semibold mb-4 text-steam-text">套餐对比</h2>
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* 表头：套餐名 + 价格 */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                <div /> {/* 空占位 */}
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`relative rounded-t-sm p-4 text-center ${
                      plan.isRecommended
                        ? "ring-2 ring-vip bg-vip/5"
                        : "bg-steam-medium border border-steam-light/30"
                    }`}
                  >
                    {plan.isRecommended && (
                      <div className="absolute -top-px left-1/2 -translate-x-1/2">
                        <div className="bg-vip text-black text-xs font-semibold px-3 py-0.5 rounded-b-sm">
                          推荐
                        </div>
                      </div>
                    )}
                    <h3 className="font-semibold mt-2 text-steam-text">{plan.name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-2xl font-bold text-steam-text">{plan.price}</span>
                    </div>
                    <p className="text-xs text-steam-text-dim mt-0.5">
                      {plan.days} 天
                    </p>
                  </div>
                ))}
              </div>

              {/* 功能行 */}
              {FEATURE_ROWS.map((row, i) => (
                <div
                  key={row.label}
                  className={`grid grid-cols-4 gap-3 ${
                    i % 2 === 0 ? "bg-steam-light/10" : ""
                  }`}
                >
                  <div className="flex items-center px-4 py-3 text-sm font-medium text-steam-text">
                    {row.label}
                  </div>
                  {(["monthly", "quarterly", "yearly"] as const).map((key) => (
                    <div
                      key={key}
                      className={`flex items-center justify-center py-3 ${
                        PLANS.find((p) => p.id === key)?.isRecommended
                          ? "ring-2 ring-vip ring-inset"
                          : ""
                      }`}
                    >
                      {row[key] ? (
                        <Check className="w-5 h-5 text-green-500" />
                      ) : (
                        <span className="w-5 h-5 flex items-center justify-center text-steam-text-dim/30">
                          --
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* 每日均价 + 省 X% */}
              <div className="grid grid-cols-4 gap-3 mt-3">
                <div className="flex items-center px-4 text-sm text-steam-text-dim">
                  每日均价
                </div>
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`text-center py-2 ${
                      plan.isRecommended
                        ? "ring-2 ring-vip ring-inset"
                        : ""
                    }`}
                  >
                    <span className="text-sm font-semibold text-steam-text">
                      {plan.dailyPrice} 币/天
                    </span>
                    {plan.savePct > 0 && (
                      <Badge
                        className="ml-1.5 text-xs bg-emerald-500/10 text-emerald-500 border-0 rounded-sm"
                      >
                        省 {plan.savePct}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>

              {/* 购买按钮行 */}
              <div className="grid grid-cols-4 gap-3 mt-3">
                <div />
                {PLANS.map((plan) => (
                  <div
                    key={plan.id}
                    className={`p-3 rounded-b-sm ${
                      plan.isRecommended
                        ? "ring-2 ring-vip bg-vip/5"
                        : "bg-steam-medium border border-steam-light/30 border-t-0"
                    }`}
                  >
                    <Button
                      className={`w-full rounded-sm ${
                        plan.isRecommended
                          ? "bg-vip hover:bg-vip-dark text-black"
                          : "bg-steam-light text-steam-text hover:bg-steam-light/80"
                      }`}
                      onClick={() => handlePurchase(plan)}
                      disabled={subscribeMutation.isPending}
                    >
                      {subscribeMutation.isPending
                        ? "开通中..."
                        : vipStatus?.isVip
                          ? "续费"
                          : "立即开通"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ====== 游戏币提示 ====== */}
        <Card className="border border-steam-blue/20 bg-steam-light/30 rounded-sm">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-sm bg-steam-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <CalendarCheck className="w-4 h-4 text-steam-blue" />
            </div>
            <div className="text-sm">
              <p className="font-semibold text-steam-text mb-1">
                如何获得游戏币？
              </p>
              <p className="text-steam-text-dim">
                每日签到可获得 10~50 游戏币，VIP
                用户签到额外 +50%。坚持签到积累游戏币，开通 VIP
                享受更多特权。
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
