"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar, Eye, Star, Download, Share2, Link2, HelpCircle,
  Coins, Info, AlertTriangle, Tag, Heart, Monitor, HardDrive,
  Languages, Keyboard, Copy, CheckCircle, Lock, ExternalLink,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/contexts/auth-context";
import {
  fetchGameDetail, fetchPurchaseGame, fetchPurchaseStatus,
  fetchAddFavorite, fetchRemoveFavorite, fetchFavorites,
  type GameItem, type DownloadLink, type PurchaseStatus,
} from "@/lib/api";
import { toast } from "sonner";

const FAQ_ITEMS = [
  { question: "游戏怎么安装？", answer: "把游戏网盘内的文件全部下载下来，双击.exe后缀的安装程序，安装到指定文件夹目录，安装完以后进入游戏目录，打开运行程序就可以游玩了。" },
  { question: "打开游戏闪退？", answer: "请注意游戏安装路径中不能含有中文；提示报.DLL错误需要下载安装游戏运行库；系统用户名不能是中文；安装时尽量关闭杀毒软件。" },
  { question: "打开游戏弹出Steam？", answer: "这种情况一般是由于游戏未覆盖破解补丁导致，需要自行覆盖到游戏目录。" },
  { question: "解压密码/激活码是什么？", answer: "请仔细查看游戏页面右侧的「其他信息」区域，激活码一般为 XDGAME 或 WWW.XDGAME.COM" },
];

const PLATFORM_COLORS: Record<string, string> = {
  "百度网盘": "bg-blue-500", "天翼云盘": "bg-sky-500",
  "迅雷云盘": "bg-yellow-500", "夸克网盘": "bg-orange-500",
  "正版购买": "bg-green-600",
};

function getPlatformColor(name: string) {
  for (const [k, v] of Object.entries(PLATFORM_COLORS)) {
    if (name.includes(k)) return v;
  }
  return "bg-blue-600";
}

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, loading: authLoading } = useAuth();
  const gameId = Number(params.id);

  const [game, setGame] = useState<GameItem | null>(null);
  const [status, setStatus] = useState<PurchaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [favorited, setFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [dateString, setDateString] = useState("");

  useEffect(() => {
    setDateString(new Date().toLocaleDateString("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" }));
  }, []);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    fetchGameDetail(gameId)
      .then((data) => setGame(data as GameItem))
      .catch(() => setGame(null))
      .finally(() => setLoading(false));
  }, [gameId]);

  const loadStatus = useCallback(() => {
    if (!gameId || !isLoggedIn) {
      setStatus(null);
      return;
    }
    fetchPurchaseStatus(gameId)
      .then((data) => setStatus(data as PurchaseStatus))
      .catch(() => setStatus(null));
  }, [gameId, isLoggedIn]);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    if (!gameId || !isLoggedIn) {
      setFavorited(false);
      return;
    }
    fetchFavorites()
      .then((res) => {
        const list = res?.list ?? [];
        setFavorited(list.some((g) => g.id === gameId));
      })
      .catch(() => {});
  }, [gameId, isLoggedIn]);

  const handleToggleFavorite = async () => {
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    if (favLoading) return;
    setFavLoading(true);
    try {
      if (favorited) {
        await fetchRemoveFavorite(gameId);
        setFavorited(false);
        toast.success("已取消收藏");
      } else {
        await fetchAddFavorite(gameId);
        setFavorited(true);
        toast.success("收藏成功");
      }
    } catch (err: any) {
      toast.error(err?.message || "操作失败");
    } finally {
      setFavLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!game) return;
    if (!isLoggedIn) {
      router.push("/auth/login");
      return;
    }
    setPurchasing(true);
    try {
      const result = await fetchPurchaseGame(game.id) as any;
      setStatus({ purchased: true, downloadLinks: result.downloadLinks, activationCode: result.activationCode, validDays: result.validDays });
      toast.success(`购买成功！消耗 ${result.coinsPaid} 游戏币，剩余 ${result.coinsRemaining} 游戏币`);
    } catch (err: any) {
      toast.error(err?.message || "购买失败，请重试");
    } finally {
      setPurchasing(false);
    }
  };

  const handleCopyPassword = (password: string, index: number) => {
    navigator.clipboard.writeText(password);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
    toast.success("提取码已复制");
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("链接已复制");
  };

  const images = game ? (game.screenshots?.length ? game.screenshots : game.coverImage ? [game.coverImage] : []) : [];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">加载中...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!game) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-100">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 text-center shadow-sm">
            <h2 className="text-xl font-bold mb-4">游戏不存在</h2>
            <p className="text-gray-500 mb-4">抱歉，您请求的游戏未找到</p>
            <button onClick={() => router.push("/")} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              返回游戏商店
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const isPurchased = status?.purchased === true;
  const downloadLinks: DownloadLink[] = status?.downloadLinks ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 max-w-7xl mx-auto w-full px-2 md:px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* 主内容 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 游戏详情卡片 */}
            <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
              {/* 标题 */}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3">
                  {game.name}{game.nameEn ? `/${game.nameEn}` : ""}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <Link href={`/category?cat=${encodeURIComponent(game.category)}`}>
                    <span className="border px-2 py-0.5 rounded text-xs cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors">{game.category}</span>
                  </Link>
                  {game.releaseDate && (
                    <span className="flex items-center gap-1 text-gray-500"><Calendar className="w-4 h-4" />{game.releaseDate}</span>
                  )}
                  <span className="flex items-center gap-1 text-gray-500"><Star className="w-4 h-4 text-yellow-500" />{game.likes}</span>
                  <span className="flex items-center gap-1 text-gray-500"><Eye className="w-4 h-4" />{game.views}</span>
                  <span className="flex items-center gap-1 text-yellow-600 font-medium"><Coins className="w-4 h-4" />{game.price}</span>
                </div>
              </div>

              <hr />

              {/* 游戏介绍 */}
              {game.description && (
                <div>
                  <h3 className="font-semibold mb-3">游戏介绍</h3>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{game.description}</p>
                </div>
              )}

              {/* 游戏视频 */}
              {game.videoUrl && (
                <div>
                  <h3 className="font-semibold mb-3">游戏视频</h3>
                  <video muted autoPlay controls className="w-full rounded-lg shadow-sm" src={game.videoUrl} style={{ maxHeight: 400 }}>
                    您的浏览器不支持视频标签。
                  </video>
                </div>
              )}

              {/* 游戏截图 */}
              {images.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">游戏截图</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {images.map((src, i) => (
                      <div
                        key={i}
                        className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity bg-gray-100"
                        onClick={() => { setPreviewIndex(i); setPreviewOpen(true); }}
                      >
                        <Image src={src} alt={`${game.name} 截图 ${i + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 版本信息 */}
              {(game.version || game.size || game.language || game.support) && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Info className="w-5 h-5 text-purple-500" />版本介绍</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {game.version && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Monitor className="w-6 h-6 mx-auto text-blue-500 mb-1" />
                        <div className="text-sm font-bold text-blue-600">{game.version}</div>
                        <div className="text-xs text-gray-400">版本号</div>
                      </div>
                    )}
                    {game.size && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <HardDrive className="w-6 h-6 mx-auto text-green-500 mb-1" />
                        <div className="text-sm font-bold text-green-600">{game.size}</div>
                        <div className="text-xs text-gray-400">容量大小</div>
                      </div>
                    )}
                    {game.language && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Languages className="w-6 h-6 mx-auto text-orange-500 mb-1" />
                        <div className="text-sm font-bold text-orange-600">{game.language}</div>
                        <div className="text-xs text-gray-400">语言支持</div>
                      </div>
                    )}
                    {game.support && (
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Keyboard className="w-6 h-6 mx-auto text-purple-500 mb-1" />
                        <div className="text-sm font-bold text-purple-600">{game.support}</div>
                        <div className="text-xs text-gray-400">操作方式</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 声明 */}
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-700 leading-relaxed">
                    <span className="font-medium">声明：</span>本站提供的内容均转载自网络，仅供参考使用。不得将上述内容用于商业或者非法用途，否则一切后果请用户自负。您必须在下载后的24个小时之内，从您的电脑中彻底删除上述内容。如果您喜欢该内容，请支持正版。
                  </p>
                </div>
              </div>

              {/* 标签 */}
              {game.tags && game.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-blue-500" />标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {game.tags.map((tag, i) => (
                      <span key={i} className="bg-gray-100 hover:bg-blue-50 hover:text-blue-600 text-gray-600 text-sm px-3 py-1 rounded-full cursor-pointer transition-colors">{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              <hr />

              {/* 操作按钮 */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleToggleFavorite}
                  disabled={favLoading}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg transition-colors ${
                    favorited
                      ? "border-red-300 text-red-500 bg-red-50"
                      : "hover:border-red-300 hover:text-red-500"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${favorited ? "fill-red-500" : ""}`} />
                  {favorited ? "已收藏" : "收藏"}
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg hover:border-blue-300 hover:text-blue-500 transition-colors">
                  <Share2 className="w-4 h-4" />分享
                </button>
                <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-4 py-2 text-sm border rounded-lg hover:border-green-300 hover:text-green-500 transition-colors">
                  <Link2 className="w-4 h-4" />复制链接
                </button>
              </div>
            </div>
          </div>

          {/* 侧边栏 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 问候 */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl p-4 text-white">
              <p className="text-sm">夜深了，你也睡不着吗？</p>
              <p className="text-sm opacity-80 mt-1">今天是：{dateString}</p>
            </div>

            {/* 资源信息/下载 */}
            <div className="bg-white rounded-xl shadow-sm p-4 space-y-4">
              <h3 className="font-semibold flex items-center gap-2"><Download className="w-5 h-5 text-blue-500" />资源信息</h3>

              {isPurchased ? (
                <>
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm font-medium text-green-700">您已购买此游戏</span>
                  </div>
                  <div className="space-y-2">
                    {downloadLinks.length > 0 ? downloadLinks.map((link, i) => (
                      <div key={i} className="space-y-1.5">
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-center gap-2 w-full h-10 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity ${getPlatformColor(link.name)}`}
                        >
                          <ExternalLink className="w-4 h-4" />{link.name}
                        </a>
                        {link.password && (
                          <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 rounded-lg text-xs">
                            <span className="text-gray-500">提取码：<span className="font-mono font-medium text-gray-800">{link.password}</span></span>
                            <button onClick={() => handleCopyPassword(link.password!, i)} className="text-blue-600 hover:text-blue-500 transition-colors">
                              {copiedIndex === i ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        )}
                      </div>
                    )) : (
                      <p className="text-sm text-gray-400 text-center py-2">暂无下载链接</p>
                    )}
                  </div>
                  <hr />
                  <div className="space-y-2 text-sm">
                    {status?.activationCode && (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">激活码</span>
                        <span className="font-medium text-blue-600">{status.activationCode}</span>
                      </div>
                    )}
                    {status?.validDays !== undefined && status.validDays > 0 && (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">有效期</span>
                        <span className="font-medium">{status.validDays} 天内有效</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">累计下载</span>
                      <span className="font-medium">{game.downloads}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-0">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-t-lg">
                      <span className="text-sm text-gray-500">普通用户</span>
                      <span className="font-medium text-sm">{game.price} 游戏币</span>
                    </div>
                    {game.memberPrice > 0 && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 border-t border-white">
                        <span className="text-sm text-gray-500">会员</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{game.memberPrice} 游戏币</span>
                          {game.price > 0 && game.memberPrice < game.price && (
                            <span className="bg-red-100 text-red-700 text-xs px-1.5 py-0.5 rounded">
                              {(game.memberPrice / game.price * 10).toFixed(1).replace(/\.0$/, "")}折
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {!isLoggedIn && !authLoading ? (
                    <button
                      onClick={() => router.push("/auth/login")}
                      className="w-full h-12 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-5 h-5" />登录后购买
                    </button>
                  ) : (
                    <button
                      onClick={handlePurchase}
                      disabled={purchasing}
                      className="w-full h-12 text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-5 h-5" />
                      {purchasing ? "购买中..." : game.memberPrice > 0 && game.memberPrice < game.price
                        ? `立即下载（会员 ${game.memberPrice} / 原价 ${game.price} 游戏币）`
                        : `立即下载（${game.price} 游戏币）`
                      }
                    </button>
                  )}

                  <hr />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <span className="text-gray-500">累计下载</span>
                      <span className="font-medium">{game.downloads}</span>
                    </div>
                    {game.releaseDate && (
                      <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-gray-500">最近更新</span>
                        <span className="font-medium">{game.releaseDate}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 leading-relaxed">
                      未提供激活码，默认为：XDGAME 或 WWW.XDGAME.COM<br />
                      下载遇到问题？可联系客服或留言反馈
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* 常见问题 */}
            <div className="bg-white rounded-xl shadow-sm p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-orange-500" />常见问题</h3>
              <div className="space-y-2">
                {FAQ_ITEMS.map((item, i) => (
                  <div key={i} className="border rounded-lg overflow-hidden">
                    <button
                      onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                      className="w-full text-left px-3 py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      {item.question}
                      <span className="text-gray-400 ml-2">{faqOpen === i ? "−" : "+"}</span>
                    </button>
                    {faqOpen === i && (
                      <div className="px-3 pb-3 text-sm text-gray-500 leading-relaxed border-t bg-gray-50 pt-2">
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* 截图预览 */}
      {previewOpen && images.length > 0 && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={() => setPreviewOpen(false)}
        >
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewIndex((p) => (p - 1 + images.length) % images.length); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[80vh] w-full mx-16" onClick={(e) => e.stopPropagation()}>
            <Image src={images[previewIndex]} alt="" fill className="object-contain" />
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setPreviewIndex((p) => (p + 1) % images.length); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {previewIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </div>
  );
}
