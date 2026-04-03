"use client";

import { useState, useEffect } from "react";
import {
  CalendarCheck, Gift, Coins, Crown, Flame,
  Sparkles, Clock, Zap,
} from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchSignInStatus,
  fetchSignIn,
  type SignInStatus,
} from "@/lib/api";
import { toast } from "sonner";

const DEFAULT_RULES = [
  "每日签到可获得游戏币奖励，连续签到奖励更丰厚",
  "连续签到7天可获得神秘礼包，中断后重新计算",
  "VIP用户签到可获得额外加成游戏币奖励",
  "每日0点刷新签到状态，请及时签到",
];

export default function SignInPage() {
  const { user, isLoggedIn, loading: authLoading, refreshProfile } = useAuth();
  const [signInStatus, setSignInStatus] = useState<SignInStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [earnedCoins, setEarnedCoins] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetchSignInStatus()
      .then((status) => setSignInStatus(status as SignInStatus))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [isLoggedIn, authLoading]);

  const handleSignIn = async () => {
    if (!signInStatus || signInStatus.todaySigned) return;
    setIsSigningIn(true);
    try {
      const result = await fetchSignIn() as any;
      setEarnedCoins(result.coins ?? 0);
      setSignInStatus({
        todaySigned: true,
        consecutiveDays: result.consecutiveDays ?? (signInStatus.consecutiveDays + 1),
        totalDays: signInStatus.totalDays + 1,
      });
      setShowReward(true);
      setTimeout(() => setShowReward(false), 3000);
      // 刷新用户信息（游戏币余额）
      refreshProfile();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "签到失败";
      toast.error(msg);
    } finally {
      setIsSigningIn(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 bg-gray-100 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-gray-100">
          <CalendarCheck className="w-16 h-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-600">请先登录</h2>
          <p className="text-gray-400 text-sm">登录后即可每日签到领取奖励</p>
          <Link
            href="/auth/login"
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            去登录
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const consecutive = signInStatus?.consecutiveDays ?? 0;
  const totalDays = signInStatus?.totalDays ?? 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          {/* 页面标题 */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <CalendarCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">每日签到</h1>
                <p className="text-sm text-muted-foreground">坚持签到，领取丰厚奖励</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>
                {currentTime.toLocaleDateString("zh-CN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 左侧：签到主区域 */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-0 shadow-sm overflow-hidden">
                {/* 顶部渐变 */}
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Crown className="w-8 h-8 text-white/60" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold">{user?.username ?? "用户"}</span>
                        <div className="flex items-center gap-4 mt-1 text-white/80 text-sm">
                          <span className="flex items-center gap-1">
                            <Flame className="w-4 h-4 text-orange-300" />
                            连续 {consecutive} 天
                          </span>
                          <span className="flex items-center gap-1">
                            <CalendarCheck className="w-4 h-4" />
                            累计 {totalDays} 天
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-white/80">当前游戏币</div>
                      <div className="flex items-center gap-1 text-2xl font-bold">
                        <Coins className="w-6 h-6 text-yellow-300" />
                        {user?.gameCoins ?? 0}
                      </div>
                    </div>
                  </div>
                </div>

                <CardContent className="p-6">
                  {/* 签到按钮 */}
                  <div className="flex items-center justify-center mb-6">
                    <Button
                      size="lg"
                      className={`h-14 px-12 text-lg font-semibold transition-all ${
                        signInStatus?.todaySigned
                          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                          : "bg-primary hover:bg-primary/90 hover:scale-105"
                      }`}
                      onClick={handleSignIn}
                      disabled={signInStatus?.todaySigned || isSigningIn}
                    >
                      {isSigningIn ? (
                        <span className="flex items-center gap-2">
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          签到中...
                        </span>
                      ) : signInStatus?.todaySigned ? (
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
                  </div>

                  {/* 签到成功提示 */}
                  {showReward && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center justify-center gap-2 text-green-600">
                        <Gift className="w-5 h-5" />
                        <span className="font-semibold">签到成功!</span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-green-700">
                        +{earnedCoins} 游戏币
                      </div>
                    </div>
                  )}

                  {/* 签到统计 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-orange-50 rounded-lg p-4 text-center">
                      <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">{consecutive}</div>
                      <div className="text-xs text-muted-foreground">连续签到天数</div>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <CalendarCheck className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{totalDays}</div>
                      <div className="text-xs text-muted-foreground">累计签到天数</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 右侧 */}
            <div className="space-y-6">
              {/* 签到规则 */}
              <Card className="border-0 shadow-sm">
                <CardContent className="p-6">
                  <h3 className="font-semibold flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    签到规则
                  </h3>
                  <div className="space-y-3 text-sm text-muted-foreground">
                    {DEFAULT_RULES.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs text-primary font-medium">{i + 1}</span>
                        </div>
                        <p>{rule}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* VIP 特权入口 */}
              <Card className="border-0 shadow-sm bg-gradient-to-br from-yellow-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-400 flex items-center justify-center">
                      <Crown className="w-5 h-5 text-yellow-900" />
                    </div>
                    <div>
                      <h3 className="font-semibold">开通 VIP</h3>
                      <p className="text-sm text-muted-foreground">享受更多签到特权</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                    <li className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      签到奖励 +50%
                    </li>
                    <li className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-yellow-500" />
                      专属 VIP 礼包
                    </li>
                    <li className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-500" />
                      游戏折扣特权
                    </li>
                  </ul>
                  <Link href="/vip">
                    <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-yellow-900">
                      立即开通
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
