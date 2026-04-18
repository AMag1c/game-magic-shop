"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarCheck,
  Gift,
  Coins,
  Crown,
  Flame,
  Sparkles,
  Zap,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/auth-context";
import { useSignInStatus, useSignInAction } from "@/lib/hooks/use-sign-in";
import { toast } from "sonner";

const SIGN_IN_RULES = [
  "每日签到可获得游戏币奖励，连续签到奖励更丰厚",
  "连续签到 7 天可获得神秘礼包，中断后重新计算",
  "VIP 用户签到可获得额外加成游戏币奖励",
  "每日 0 点刷新签到状态，请及时签到",
];

const VIP_PERKS = [
  { icon: Sparkles, text: "签到奖励 +50%" },
  { icon: Gift, text: "专属 VIP 礼包" },
  { icon: Zap, text: "游戏折扣特权" },
];

// 获取最近 7 天的星期几标签
function getWeekdayLabels(): string[] {
  const days = ["日", "一", "二", "三", "四", "五", "六"];
  const result: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    result.push(days[d.getDay()]);
  }
  return result;
}

// 根据 consecutiveDays 和 todaySigned 计算 7 天签到状态
// 返回数组索引 0~6, 6 = 今天, 5 = 昨天 ...
function getWeekSignedStates(
  consecutiveDays: number,
  todaySigned: boolean
): ("signed" | "today" | "none")[] {
  const states: ("signed" | "today" | "none")[] = Array(7).fill("none");
  // 从今天 (index=6) 往前标记
  let signedCount = consecutiveDays;
  if (todaySigned) {
    states[6] = "signed";
    signedCount--;
  } else {
    states[6] = "today"; // 今天未签到，显示脉冲动画
  }
  // 从昨天往前标记已签到的天数
  for (let i = 5; i >= 0 && signedCount > 0; i--) {
    states[i] = "signed";
    signedCount--;
  }
  return states;
}

export default function SignInPage() {
  const { user, isLoggedIn, loading: authLoading, refreshProfile } = useAuth();
  const {
    data: signInStatus,
    isLoading: statusLoading,
  } = useSignInStatus(isLoggedIn);
  const signInAction = useSignInAction();

  const [showReward, setShowReward] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  const loading = authLoading || statusLoading;
  const consecutive = signInStatus?.consecutiveDays ?? 0;
  const totalDays = signInStatus?.totalDays ?? 0;
  const todaySigned = signInStatus?.todaySigned ?? false;

  const weekLabels = getWeekdayLabels();
  const weekStates = getWeekSignedStates(consecutive, todaySigned);

  const handleSignIn = async () => {
    if (!signInStatus || todaySigned) return;
    try {
      const result = await signInAction.mutateAsync();
      setEarnedCoins((result as any)?.coins ?? 0);
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
      refreshProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "签到失败";
      toast.error(msg);
    }
  };

  // -- 加载中 --
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 w-full rounded-sm" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-52 w-full rounded-sm" />
            <Skeleton className="h-48 w-full rounded-sm" />
          </div>
        </div>
      </div>
    );
  }

  // -- 未登录 --
  if (!isLoggedIn) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <div className="w-20 h-20 rounded-sm bg-steam-medium flex items-center justify-center">
          <CalendarCheck className="w-10 h-10 text-steam-text-dim/50" />
        </div>
        <h2 className="text-xl font-semibold text-steam-text-dim">请先登录</h2>
        <p className="text-steam-text-dim/70 text-sm">
          登录后即可每日签到领取奖励
        </p>
        <Button asChild className="bg-steam-blue text-steam-dark hover:bg-steam-blue-hover rounded-sm">
          <Link href="/auth/login">去登录</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* ====== 左侧 2 cols ====== */}
        <div className="lg:col-span-2 space-y-6">
          {/* 签到主卡 */}
          <Card className="border border-steam-light/30 bg-steam-medium overflow-hidden rounded-sm">
            {/* 顶部渐变区域: steam-light -> steam-medium */}
            <div className="bg-gradient-to-r from-steam-light to-steam-medium p-6">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-lg font-semibold text-steam-text">
                    {user?.username ?? "用户"}
                  </span>
                  <p className="text-steam-text-dim text-sm mt-0.5">坚持签到，领取丰厚奖励</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-steam-text-dim">游戏币余额</div>
                  <div className="flex items-center gap-1.5 text-2xl font-bold text-vip">
                    <Coins className="w-5 h-5 text-yellow-300" />
                    {user?.gameCoins ?? 0}
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6 space-y-6">
              {/* 7 天日历条 */}
              <div className="flex items-center justify-between gap-2">
                {weekStates.map((state, i) => (
                  <div key={i} className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        state === "signed"
                          ? "bg-steam-blue text-steam-dark"
                          : state === "today"
                            ? "bg-steam-dark border-2 border-steam-blue/50"
                            : "bg-steam-dark text-steam-text-dim"
                      }`}
                    >
                      {state === "signed" && (
                        <Check className="w-4.5 h-4.5 text-steam-dark" />
                      )}
                      {state === "today" && (
                        <>
                          {/* 脉冲动画 */}
                          <span className="absolute inset-0 rounded-full animate-ping bg-steam-blue/20" />
                          <span className="relative w-2 h-2 rounded-full bg-steam-blue" />
                        </>
                      )}
                      {state === "none" && (
                        <span className="w-2 h-2 rounded-full bg-steam-text-dim/30" />
                      )}
                    </div>
                    <span className="text-xs text-steam-text-dim">
                      {weekLabels[i]}
                    </span>
                  </div>
                ))}
              </div>

              {/* 签到按钮 + 签到成功动效 */}
              <div className="relative flex items-center justify-center">
                <Button
                  size="lg"
                  className={`h-12 px-14 text-base font-semibold transition-all rounded-sm ${
                    todaySigned
                      ? "bg-steam-dark text-steam-text-dim cursor-not-allowed"
                      : "bg-steam-blue hover:bg-steam-blue-hover text-steam-dark hover:scale-105"
                  }`}
                  onClick={handleSignIn}
                  disabled={todaySigned || signInAction.isPending}
                >
                  {signInAction.isPending ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-steam-dark/30 border-t-steam-dark rounded-full animate-spin" />
                      签到中...
                    </span>
                  ) : todaySigned ? (
                    <span className="flex items-center gap-2">
                      <CalendarCheck className="w-5 h-5" />
                      今日已签到
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      立即签到
                    </span>
                  )}
                </Button>

                {/* 签到成功漂浮动效 */}
                <AnimatePresence>
                  {showReward && (
                    <motion.div
                      initial={{ opacity: 1, scale: 0, y: 0 }}
                      animate={{ opacity: 0, scale: 1.2, y: -60 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 2, ease: "easeOut" }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                    >
                      <span className="text-2xl font-bold text-steam-blue whitespace-nowrap">
                        +{earnedCoins} 游戏币
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* 统计卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-steam-light/30 rounded-sm p-4 text-center">
                  <Flame className="w-6 h-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-orange-400">
                    {consecutive}
                  </div>
                  <div className="text-xs text-steam-text-dim">连续签到天数</div>
                </div>
                <div className="bg-steam-light/30 rounded-sm p-4 text-center">
                  <CalendarCheck className="w-6 h-6 text-steam-blue mx-auto mb-2" />
                  <div className="text-2xl font-bold text-steam-blue">{totalDays}</div>
                  <div className="text-xs text-steam-text-dim">累计签到天数</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ====== 右侧 1 col ====== */}
        <div className="space-y-6">
          {/* 签到规则 */}
          <Card className="border border-steam-light/30 bg-steam-medium rounded-sm">
            <CardContent className="p-6">
              <h3 className="font-semibold flex items-center gap-2 mb-4 text-steam-text">
                <Sparkles className="w-5 h-5 text-steam-blue" />
                签到规则
              </h3>
              <div className="space-y-3 text-sm text-steam-text-dim">
                {SIGN_IN_RULES.map((rule, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-sm bg-steam-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs text-steam-blue font-semibold">
                        {i + 1}
                      </span>
                    </div>
                    <p>{rule}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* VIP 特权入口 */}
          <Card className="border border-vip/20 bg-gradient-to-br from-vip/10 to-vip-dark/10 rounded-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-sm bg-vip flex items-center justify-center">
                  <Crown className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-steam-text">开通 VIP</h3>
                  <p className="text-sm text-steam-text-dim">
                    享受更多签到特权
                  </p>
                </div>
              </div>
              <ul className="space-y-2 text-sm text-steam-text-dim mb-4">
                {VIP_PERKS.map((perk) => (
                  <li key={perk.text} className="flex items-center gap-2">
                    <perk.icon className="w-4 h-4 text-vip" />
                    {perk.text}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-vip hover:bg-vip-dark text-black rounded-sm">
                <Link href="/vip">立即开通</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
