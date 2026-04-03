import axios, { type AxiosRequestConfig } from "axios";

const TOKEN_KEY = "gms_token";

export const tokenStorage = {
  get: (): string | null =>
    typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null,
  set: (token: string): void => {
    if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
  },
  clear: (): void => {
    if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
  },
};

const _request = axios.create({
  timeout: 15000,
});

// 请求拦截：注入 Bearer Token
_request.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// 401 并发锁：多个请求同时 401 时只处理一次跳转
let isRedirectingTo401 = false;

_request.interceptors.response.use(
  (res) => {
    const body = res.data;
    if (body && typeof body === "object" && "code" in body) {
      if (body.code !== 0) {
        return Promise.reject(new Error(body.msg || body.message || "请求失败"));
      }
      return body.data;
    }
    return body;
  },
  (err) => {
    // 401 未授权：清除 token 并跳转登录页（加锁防止并发重复跳转）
    if (err?.response?.status === 401) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !isRedirectingTo401) {
        const isOnAuthPage = window.location.pathname.startsWith("/auth");
        if (!isOnAuthPage) {
          isRedirectingTo401 = true;
          window.location.href = "/auth/login";
        }
      }
      return Promise.reject(new Error("登录已过期，请重新登录"));
    }

    const msg =
      err?.response?.data?.msg ||
      err?.response?.data?.message ||
      err?.message ||
      "网络错误";
    return Promise.reject(new Error(msg));
  }
);

const request = {
  get<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return _request.get(url, config) as unknown as Promise<T>;
  },
  post<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return _request.post(url, data, config) as unknown as Promise<T>;
  },
  put<T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return _request.put(url, data, config) as unknown as Promise<T>;
  },
  delete<T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return _request.delete(url, config) as unknown as Promise<T>;
  },
};

export default request;
