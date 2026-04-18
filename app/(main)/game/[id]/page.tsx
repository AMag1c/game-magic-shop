"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Star, Eye, Download, Heart, Link2, AlertTriangle, Tag,
  Monitor, HardDrive, Languages, Keyboard, HelpCircle,
  Coins, Calendar,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumb } from "@/components/breadcrumb";
import { ScreenshotCarousel } from "@/components/screenshot-carousel";
import { StickyPurchaseCard } from "@/components/sticky-purchase-card";
import { RelatedGames } from "@/components/related-games";
import { useAuth } from "@/contexts/auth-context";
import { useGameDetail } from "@/lib/hooks/use-game-detail";
import { useFavorites, useAddFavorite, useRemoveFavorite } from "@/lib/hooks/use-favorites";
import { toast } from "sonner";

const FAQ_ITEMS = [
  { q: "游戏怎么安装？", a: "把游戏网盘内的文件全部下载下来，双击.exe后缀的安装程序，安装到指定文件夹目录，安装完以后进入游戏目录，打开运行程序就可以游玩了。" },
  { q: "打开游戏闪退？", a: "请注意游戏安装路径中不能含有中文；提示报.DLL错误需要下载安装游戏运行库；系统用户名不能是中文；安装时尽量关闭杀毒软件。" },
  { q: "打开游戏弹出Steam？", a: "这种情况一般是由于游戏未覆盖破解补丁导致，需要自行覆盖到游戏目录。" },
  { q: "解压密码/激活码是什么？", a: "请仔细查看游戏页面右侧的资源信息区域，激活码一般为 XDGAME 或 WWW.XDGAME.COM" },
];

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isLoggedIn } = useAuth();
  const gameId = Number(params.id);

  const { data: game, isLoading } = useGameDetail(gameId);
  const { data: favorites } = useFavorites(isLoggedIn);
  const addFav = useAddFavorite();
  const removeFav = useRemoveFavorite();
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const isFavorited = favorites?.some((g) => g.id === gameId) ?? false;

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    try {
      if (isFavorited) {
        await removeFav.mutateAsync(gameId);
        toast.success("已取消收藏");
      } else {
        await addFav.mutateAsync(gameId);
        toast.success("收藏成功");
      }
    } catch (err: any) {
      toast.error(err?.message || "操作失败");
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("链接已复制");
  };

  // 加载态
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
        <Skeleton className="w-full h-[200px] md:h-[300px] rounded-sm" />
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
        <h2 className="text-xl font-bold text-steam-text">游戏不存在</h2>
        <p className="text-steam-text-dim">抱歉，您请求的游戏未找到</p>
        <Button
          onClick={() => router.push("/")}
          className="cursor-pointer bg-steam-blue text-steam-dark hover:bg-steam-blue-hover"
        >
          返回首页
        </Button>
      </div>
    );
  }

  const images = game.screenshots?.length ? game.screenshots : game.coverImage ? [game.coverImage] : [];

  return (
    <div className="space-y-6">
      {/* Hero 区域 - 深蓝背景，左封面 + 右信息 */}
      <div className="bg-steam-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-8">
          {/* 面包屑 */}
          <div className="mb-6">
            <Breadcrumb
              items={[
                { label: "首页", href: "/" },
                { label: game.category, href: `/category?cat=${encodeURIComponent(game.category)}` },
                { label: game.name },
              ]}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* 左侧大封面图 */}
            <div className="w-full lg:w-[460px] flex-shrink-0">
              <div className="relative aspect-[16/9] rounded-sm overflow-hidden shadow-steam-lg">
                <Image
                  src={game.coverImage || "/game-sample.jpg"}
                  alt={game.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* 右侧信息区 */}
            <div className="flex-1 flex flex-col justify-between min-w-0">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-steam-text mb-1">
                  {game.name}
                </h1>
                {game.nameEn && (
                  <p className="text-sm text-steam-text-dim mb-3">{game.nameEn}</p>
                )}

                {/* 分类与标签 */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-steam-light text-steam-blue border-0 rounded-sm">
                    {game.category}
                  </Badge>
                  {game.price === 0 && (
                    <Badge className="bg-steam-green text-steam-sale border-0 rounded-sm">免费</Badge>
                  )}
                  {game.memberPrice > 0 && game.memberPrice < game.price && (
                    <Badge className="bg-vip/90 text-black border-0 rounded-sm">会员特惠</Badge>
                  )}
                </div>

                {/* 统计信息 */}
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-steam-text-dim mb-4">
                  <span className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    评分 {game.rating.toFixed(1)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    浏览 {game.views}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Download className="w-4 h-4" />
                    下载 {game.downloads}
                  </span>
                  {game.releaseDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {game.releaseDate}
                    </span>
                  )}
                </div>
              </div>

              {/* 价格 */}
              <div className="bg-steam-dark/50 border border-steam-light/30 rounded-sm p-3">
                <div className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-vip" />
                  <span className="text-xl font-bold text-steam-text">
                    {game.price === 0 ? "免费" : `${game.price} 游戏币`}
                  </span>
                  {game.memberPrice > 0 && game.memberPrice < game.price && (
                    <span className="text-sm text-vip ml-2">
                      VIP {game.memberPrice} 游戏币
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* 左侧内容 */}
          <div className="lg:col-span-3 space-y-6">
            <Tabs defaultValue="intro">
              <TabsList className="bg-steam-medium rounded-sm">
                <TabsTrigger value="intro" className="rounded-sm data-[state=active]:bg-steam-light data-[state=active]:text-steam-blue">
                  游戏介绍
                </TabsTrigger>
                <TabsTrigger value="media" className="rounded-sm data-[state=active]:bg-steam-light data-[state=active]:text-steam-blue">
                  截图 & 视频
                </TabsTrigger>
                <TabsTrigger value="details" className="rounded-sm data-[state=active]:bg-steam-light data-[state=active]:text-steam-blue">
                  版本详情
                </TabsTrigger>
              </TabsList>

              <TabsContent value="intro" className="space-y-6 pt-4">
                <div className="bg-steam-medium rounded-sm p-5">
                  {game.description && (
                    <p className="text-steam-text-dim leading-relaxed whitespace-pre-line">
                      {game.description}
                    </p>
                  )}
                </div>
                {/* 声明 */}
                <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-steam-text-dim leading-relaxed">
                      本站提供的内容均转载自网络，仅供参考使用。如果您喜欢该内容，请支持正版。
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="media" className="pt-4">
                <ScreenshotCarousel
                  images={images}
                  videoUrl={game.videoUrl}
                  gameName={game.name}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-4 pt-4">
                {(game.version || game.size || game.language || game.support) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {game.version && (
                      <div className="text-center p-3 bg-steam-light/30 rounded-sm">
                        <Monitor className="w-5 h-5 mx-auto text-steam-blue mb-1" />
                        <div className="text-sm font-bold text-steam-text">{game.version}</div>
                        <div className="text-xs text-steam-text-dim">版本号</div>
                      </div>
                    )}
                    {game.size && (
                      <div className="text-center p-3 bg-steam-light/30 rounded-sm">
                        <HardDrive className="w-5 h-5 mx-auto text-emerald-400 mb-1" />
                        <div className="text-sm font-bold text-steam-text">{game.size}</div>
                        <div className="text-xs text-steam-text-dim">容量大小</div>
                      </div>
                    )}
                    {game.language && (
                      <div className="text-center p-3 bg-steam-light/30 rounded-sm">
                        <Languages className="w-5 h-5 mx-auto text-orange-400 mb-1" />
                        <div className="text-sm font-bold text-steam-text">{game.language}</div>
                        <div className="text-xs text-steam-text-dim">语言支持</div>
                      </div>
                    )}
                    {game.support && (
                      <div className="text-center p-3 bg-steam-light/30 rounded-sm">
                        <Keyboard className="w-5 h-5 mx-auto text-purple-400 mb-1" />
                        <div className="text-sm font-bold text-steam-text">{game.support}</div>
                        <div className="text-xs text-steam-text-dim">操作方式</div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <Separator className="bg-steam-light/30" />

            {/* 标签 */}
            {game.tags && game.tags.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-steam-text">
                  <Tag className="w-4 h-4 text-steam-blue" />标签
                </h3>
                <div className="flex flex-wrap gap-2">
                  {game.tags.map((tag, i) => (
                    <Link
                      key={i}
                      href={`/search?q=${encodeURIComponent(tag)}`}
                      className="bg-steam-light/40 hover:bg-steam-blue/20 text-steam-blue text-sm px-3 py-1 rounded-sm transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleToggleFavorite}
                disabled={addFav.isPending || removeFav.isPending}
                className="cursor-pointer bg-steam-light/50 border-steam-light text-steam-text hover:bg-steam-light hover:text-steam-blue rounded-sm"
              >
                <Heart className={`w-4 h-4 mr-1.5 ${isFavorited ? "fill-red-500 text-red-500" : ""}`} />
                {isFavorited ? "已收藏" : "收藏"}
              </Button>
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="cursor-pointer bg-steam-light/50 border-steam-light text-steam-text hover:bg-steam-light hover:text-steam-blue rounded-sm"
              >
                <Link2 className="w-4 h-4 mr-1.5" />
                复制链接
              </Button>
            </div>

            <Separator className="bg-steam-light/30" />

            {/* FAQ */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2 text-steam-text">
                <HelpCircle className="w-4 h-4 text-orange-400" />常见问题
              </h3>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="bg-steam-light/20 rounded-sm overflow-hidden">
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-steam-text hover:bg-steam-light/30 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      {item.q}
                      <span className="text-steam-text-dim">{faqOpen === i ? "-" : "+"}</span>
                    </button>
                    {faqOpen === i && (
                      <div className="px-4 pb-3 text-sm text-steam-text-dim leading-relaxed border-t border-steam-light/20 bg-steam-medium/50 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 右侧购买卡 */}
          <div className="lg:col-span-1">
            <StickyPurchaseCard game={game} />
          </div>
        </div>

        {/* 相关推荐 */}
        <div className="mt-10 mb-8">
          <RelatedGames categoryId={game.categoryId} currentGameId={game.id} />
        </div>
      </div>
    </div>
  );
}
