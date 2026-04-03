import request from "./request";

// ==================== 通用类型 ====================

export interface GameCategory {
  id: number;
  name: string;
  nameEn?: string;
  icon?: string;
  coverImage?: string;
  description?: string;
  sortOrder: number;
  enabled: boolean;
  createTime: string;
  updateTime: string;
}

export interface GameItem {
  id: number;
  name: string;
  nameEn?: string;
  coverImage?: string;
  description?: string;
  categoryId: number;
  category: string;
  tags?: string[];
  price: number;
  originalPrice?: number;
  memberPrice: number;
  isFeatured: boolean;
  downloads: number;
  views: number;
  likes: number;
  rating: number;
  status: "on_sale" | "off_sale";
  sortOrder: number;
  releaseDate?: string;
  version?: string;
  size?: string;
  language?: string;
  support?: string;
  activationCode?: string;
  validDays: number;
  videoUrl?: string;
  screenshots?: string[];
  createTime: string;
  updateTime: string;
}

export interface DownloadLink {
  name: string;
  url: string;
  password?: string;
}

export interface PurchaseResult {
  coinsPaid: number;
  coinsRemaining: number;
  downloadLinks: DownloadLink[];
  activationCode?: string;
  validDays: number;
}

export interface PurchaseStatus {
  purchased: boolean;
  downloadLinks?: DownloadLink[];
  activationCode?: string;
  validDays?: number;
}

export interface PageResponse<T> {
  list: T[];
  page: number;
  size: number;
  total: number;
}

export interface UserProfile {
  userId: number;
  username: string;
  email?: string;
  gameCoins: number;
  avatar?: string;
}

// ==================== 游戏 ====================

export const fetchGameCategories = () =>
  request.get<GameCategory[]>("/api/game-categories");

export const fetchGameList = (params?: {
  categoryId?: number;
  keyword?: string;
  current?: number;
  size?: number;
}) => request.get<PageResponse<GameItem>>("/api/games", { params });

export const fetchGameDetail = (id: number) =>
  request.get<GameItem>(`/api/games/${id}`);

export const fetchPurchaseGame = (id: number) =>
  request.post<PurchaseResult>(`/api/games/${id}/purchase`);

export const fetchPurchaseStatus = (id: number) =>
  request.get<PurchaseStatus>(`/api/games/${id}/purchase-status`);

// ==================== 用户认证 ====================

export const fetchLogin = (data: { username: string; password: string }) =>
  request.post<{ token: string; refreshToken: string; message: string }>("/api/user/login", data);

export const fetchRegister = (data: {
  username: string;
  password: string;
  email?: string;
}) => request.post<{ message: string }>("/api/user/register", data);

export const fetchProfile = () => request.get<UserProfile>("/api/user/profile");

export const fetchLogout = () => request.post("/api/user/logout");

// ==================== 收藏 ====================

export const fetchFavorites = () =>
  request.get<{ list: GameItem[] }>("/api/user/favorites");

export const fetchAddFavorite = (gameId: number) =>
  request.post("/api/user/favorites", { gameId });

export const fetchRemoveFavorite = (gameId: number) =>
  request.delete(`/api/user/favorites/${gameId}`);

// ==================== 签到 ====================

export interface SignInStatus {
  todaySigned: boolean;
  consecutiveDays: number;
  totalDays: number;
}

export interface SignInResult {
  coins: number;
  consecutiveDays: number;
  coinsRemaining: number;
}

export const fetchSignInStatus = () =>
  request.get<SignInStatus>("/api/user/sign-in/status");

export const fetchSignIn = () =>
  request.post<SignInResult>("/api/user/sign-in");

// ==================== VIP ====================

export interface VipStatus {
  isVip: boolean;
  expireAt?: string;
}

export const fetchVipStatus = () =>
  request.get<VipStatus>("/api/vip/status");

export type VipPlan = "monthly" | "quarterly" | "yearly";

export const fetchVipSubscribe = (plan: VipPlan) =>
  request.post("/api/vip/subscribe", { plan });
