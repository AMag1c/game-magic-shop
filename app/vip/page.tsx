"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Coins, Check, Zap, Sparkles, Shield, CalendarCheck } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import { fetchVipStatus, fetchVipSubscribe, type VipStatus, type VipPlan } from "@/lib/api";
import { toast } from "sonner";

const VIP_PLANS: Array<{
  id: VipPlan;
  name: string;
  price: number;
  duration: string;
  durationDays: number;
  perks: string[];
  isRecommended: boolean;
  isHot?: boolean;
}> = [
  {
    id: "monthly",
    name: "月度会员",
    price: 500,
    duration: "30天",
    durationDays: 30,
    perks: ["签到奖励 +50%", "游戏购买享会员价", "专属 VIP 标识"],
    isRecommended: false,
  },
  {
    id: "quarterly",
    name: "季度会员",
    price: 1200,
    duration: "90天",
    durationDays: 90,
    perks: ["签到奖励 +50%", "游戏购买享会员价", "专属 VIP 标识", "优先客服支持"],
    isRecommended: true,
    isHot: true,
  },
  {
    id: "yearly",
    name: "年度会员",
    price: 3600,
    duration: "365天",
    durationDays: 365,
    perks: ["签到奖励 +50%", "游戏购买享会员价", "专属 VIP 标识", "优先客服支持", "专属礼包"],
    isRecommended: false,
  },
];

const VIP_PERKS = [
  {
    icon: Sparkles,
    title: "签到加成",
    desc: "每日签到额外获得 +50% 游戏币奖励",
  },
  {
    icon: Coins,
    title: "会员价格",
    desc: "所有游戏享受专属会员折扣价格",
  },
  {
    icon: Shield,
    title: "专属标识",
    desc: "账号显示专属 VIP 皇冠标识",
  },
  {
    icon: Zap,
    title: "优先支持",
    desc: "季度及以上会员享优先客服响应",
  },
];

export default function VipPage() {
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading, refreshProfile } = useAuth();
  const [vipStatus, setVipStatus] = useState<VipStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetchVipStatus()
      .then((res) => setVipStatus(res as VipStatus))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const handlePurchase = async (plan: typeof VIP_PLANS[0]) => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if ((user?.gameCoins ?? 0) < plan.price) {
      toast.error(`游戏币不足，需要 ${plan.price} 游戏币，当前余额 ${user?.gameCoins ?? 0}`);
      return;
    }
    setPurchasing(plan.id);
    try {
      await fetchVipSubscribe(plan.id);
      toast.success("VIP 开通成功!");
      // 刷新用户信息和 VIP 状态
      const [, updatedVip] = await Promise.all([refreshProfile(), fetchVipStatus()]);
      setVipStatus(updatedVip as VipStatus);
    } catch (err: any) {
      toast.error(err?.message || "开通失败，请重试");
    } finally {
      setPurchasing(null);
    }
  };

  if (!isLoggedIn && !loading && !authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-100">
          <Crown className="w-16 h-16 text-yellow-400" />
          <h2 className="text-xl font-semibold text-gray-600">请先登录</h2>
          <p className="text-gray-400 text-sm">登录后即可开通 VIP 会员</p>
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
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 py-10 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Crown className="w-8 h-8 text-white" />
              <h1 className="text-3xl font-bold text-white">VIP 会员中心</h1>
            </div>
            <p className="text-white/80 text-sm">使用游戏币开通 VIP，享受专属特权</p>

            {/* 当前 VIP 状态 */}
            {user && vipStatus?.isVip && (
              <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2">
                <Crown className="w-4 h-4 text-yellow-200" />
                <span className="text-white text-sm font-medium">
                  VIP 会员
                  {vipStatus.expireAt && ` · 到期 ${vipStatus.expireAt.slice(0, 10)}`}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8 space-y-8">
          {/* 当前游戏币余额 */}
          {user && (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">当前游戏币余额</p>
                    <p className="text-2xl font-bold text-yellow-600">{user.gameCoins}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <p>每日签到可获得游戏币</p>
                  <p>VIP 签到额外 +50%</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* VIP 特权说明 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">VIP 专属特权</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {VIP_PERKS.map((perk) => (
                <Card key={perk.title} className="border-0 shadow-sm">
                  <CardContent className="p-4 text-center">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center mx-auto mb-3">
                      <perk.icon className="w-5 h-5 text-yellow-600" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{perk.title}</h3>
                    <p className="text-xs text-muted-foreground">{perk.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 套餐列表 */}
          <div>
            <h2 className="text-lg font-semibold mb-4">选择套餐</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {VIP_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={`border-0 shadow-sm relative overflow-hidden ${
                    plan.isRecommended ? "ring-2 ring-yellow-400" : ""
                  }`}
                >
                  {plan.isHot && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-red-500 hover:bg-red-500 text-white text-xs">热门</Badge>
                    </div>
                  )}
                  {plan.isRecommended && (
                    <div className="absolute -top-px left-1/2 -translate-x-1/2">
                      <div className="bg-yellow-400 text-yellow-900 text-xs font-semibold px-4 py-1 rounded-b-lg">
                        推荐
                      </div>
                    </div>
                  )}
                  <CardContent className="p-6 flex flex-col">
                    <div className="flex items-center gap-2 mb-1 mt-2">
                      <Crown className={`w-5 h-5 ${plan.isRecommended ? "text-yellow-500" : "text-gray-400"}`} />
                      <h3 className="font-bold">{plan.name}</h3>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
                      <CalendarCheck className="w-3.5 h-3.5" />
                      {plan.duration}
                    </div>
                    <div className="flex items-baseline gap-1 mb-6">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-sm text-muted-foreground">游戏币</span>
                    </div>
                    <ul className="space-y-2 mb-6 flex-1">
                      {plan.perks.map((perk) => (
                        <li key={perk} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                          {perk}
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => handlePurchase(plan)}
                      disabled={purchasing === plan.id || loading}
                      className={plan.isRecommended ? "bg-yellow-500 hover:bg-yellow-600 text-yellow-900" : ""}
                      variant={plan.isRecommended ? "default" : "secondary"}
                    >
                      {purchasing === plan.id ? "开通中..." : vipStatus?.isVip ? "续费" : "立即开通"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* 获取游戏币提示 */}
          <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
            <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">如何获得游戏币？</p>
              <p>每日签到可获得 10~50 游戏币，VIP 用户签到额外 +50%。坚持签到积累游戏币，开通 VIP 享受更多特权。</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
