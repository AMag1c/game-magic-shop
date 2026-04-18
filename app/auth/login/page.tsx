"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Gamepad2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { fetchLogin, fetchRegister } from "@/lib/api";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

// -- 密码强度计算 --
interface StrengthInfo {
  value: number; // 0-100
  label: string;
  cssColor: string; // CSS 颜色值，用于 inline style
}

function getPasswordStrength(pwd: string): StrengthInfo {
  if (!pwd) return { value: 0, label: "", cssColor: "" };
  if (pwd.length < 6)
    return { value: 30, label: "弱", cssColor: "rgb(239 68 68)" }; // red-500
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNum = /\d/.test(pwd);
  const hasSpecial = /[^A-Za-z0-9]/.test(pwd);
  if (pwd.length >= 8 && (hasNum || hasSpecial) && hasUpper && hasLower) {
    return { value: 100, label: "强", cssColor: "rgb(16 185 129)" }; // emerald-500
  }
  if (hasUpper && hasLower) {
    return { value: 60, label: "中", cssColor: "rgb(234 179 8)" }; // yellow-500
  }
  return { value: 30, label: "弱", cssColor: "rgb(239 68 68)" }; // red-500
}

// -- 内联错误 --
interface FormErrors {
  username?: string;
  password?: string;
  email?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // 登录表单
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [loginShowPwd, setLoginShowPwd] = useState(false);
  const [loginErrors, setLoginErrors] = useState<FormErrors>({});

  // 注册表单
  const [regForm, setRegForm] = useState({
    username: "",
    password: "",
    email: "",
  });
  const [regShowPwd, setRegShowPwd] = useState(false);
  const [regErrors, setRegErrors] = useState<FormErrors>({});

  const regStrength = useMemo(
    () => getPasswordStrength(regForm.password),
    [regForm.password]
  );

  // -- blur 验证 --
  const validateLoginField = useCallback(
    (field: keyof typeof loginForm) => {
      setLoginErrors((prev) => {
        const next = { ...prev };
        if (field === "username" && !loginForm.username.trim()) {
          next.username = "请输入用户名";
        } else if (field === "username") {
          delete next.username;
        }
        if (field === "password" && !loginForm.password) {
          next.password = "请输入密码";
        } else if (field === "password") {
          delete next.password;
        }
        return next;
      });
    },
    [loginForm]
  );

  const validateRegField = useCallback(
    (field: keyof typeof regForm) => {
      setRegErrors((prev) => {
        const next = { ...prev };
        if (field === "username" && !regForm.username.trim()) {
          next.username = "请输入用户名";
        } else if (field === "username") {
          delete next.username;
        }
        if (field === "password" && !regForm.password) {
          next.password = "请输入密码";
        } else if (field === "password" && regForm.password.length < 6) {
          next.password = "密码至少 6 位";
        } else if (field === "password") {
          delete next.password;
        }
        // email 是可选字段，不做 required 校验
        if (
          field === "email" &&
          regForm.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regForm.email)
        ) {
          next.email = "邮箱格式不正确";
        } else if (field === "email") {
          delete next.email;
        }
        return next;
      });
    },
    [regForm]
  );

  // -- 提交 --
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast.error("请填写用户名和密码");
      return;
    }
    setLoading(true);
    try {
      const res = (await fetchLogin({
        username: loginForm.username,
        password: loginForm.password,
      })) as any;
      if (res?.token) await login(res.token);
      toast.success("登录成功");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message || "登录失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regForm.username || !regForm.password) {
      toast.error("请填写用户名和密码");
      return;
    }
    if (regForm.password.length < 6) {
      toast.error("密码至少 6 位");
      return;
    }
    setLoading(true);
    try {
      await fetchRegister({
        username: regForm.username,
        password: regForm.password,
        email: regForm.email || undefined,
      });
      // 注册成功后自动登录
      const loginRes = (await fetchLogin({
        username: regForm.username,
        password: regForm.password,
      })) as any;
      if (loginRes?.token) await login(loginRes.token);
      toast.success("注册成功，已自动登录");
      router.push("/");
    } catch (err: any) {
      toast.error(err?.message || "注册失败");
    } finally {
      setLoading(false);
    }
  };

  // -- 通用 input 样式 (Steam 风格) --
  const inputCls =
    "w-full px-3 py-2.5 border border-steam-light bg-steam-dark/60 rounded-sm text-sm text-steam-text placeholder:text-steam-text-dim focus:outline-none focus:border-steam-blue focus:ring-1 focus:ring-steam-blue transition-colors";
  const inputErrorCls =
    "w-full px-3 py-2.5 border border-red-500 bg-steam-dark/60 rounded-sm text-sm text-steam-text placeholder:text-steam-text-dim focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors";

  return (
    <div className="grid lg:grid-cols-2 min-h-screen">
      {/* ====== 左半屏 (仅 lg 以上可见) ====== */}
      <div className="hidden lg:flex relative flex-col items-center justify-center bg-steam-dark overflow-hidden">
        {/* 蓝色渐变装饰 */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-steam-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-56 h-56 bg-steam-blue/8 rounded-full blur-2xl" />
        <div className="absolute top-1/3 right-1/4 w-40 h-40 bg-steam-blue/5 rounded-full blur-xl" />

        <div className="relative z-10 text-center px-8">
          <div className="w-20 h-20 bg-steam-blue rounded-sm flex items-center justify-center mx-auto mb-6">
            <Gamepad2 className="w-10 h-10 text-steam-dark" />
          </div>
          <h2 className="text-3xl font-bold mb-3 text-steam-text">发现你的下一款游戏</h2>
          <p className="text-lg text-steam-text-dim">Game Magic Shop</p>
        </div>
      </div>

      {/* ====== 右半屏 ====== */}
      <div className="flex items-center justify-center p-6 bg-steam-medium">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-9 h-9 bg-steam-blue rounded-sm flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-steam-dark" />
              </div>
              <span className="text-xl font-bold text-steam-blue">GameShop</span>
            </Link>
            <p className="text-steam-text-dim mt-1.5 text-sm">游戏数字商城</p>
          </div>

          {/* Tabs 登录/注册 */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="w-full mb-6 bg-steam-dark rounded-sm">
              <TabsTrigger
                value="login"
                className="flex-1 rounded-sm data-[state=active]:bg-steam-blue data-[state=active]:text-steam-dark"
              >
                登录
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="flex-1 rounded-sm data-[state=active]:bg-steam-blue data-[state=active]:text-steam-dark"
              >
                注册
              </TabsTrigger>
            </TabsList>

            {/* ---- 登录表单 ---- */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-steam-text mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, username: e.target.value })
                    }
                    onBlur={() => validateLoginField("username")}
                    placeholder="请输入用户名"
                    className={loginErrors.username ? inputErrorCls : inputCls}
                  />
                  {loginErrors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {loginErrors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-steam-text mb-1">
                    密码
                  </label>
                  <div className="relative">
                    <input
                      type={loginShowPwd ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) =>
                        setLoginForm({ ...loginForm, password: e.target.value })
                      }
                      onBlur={() => validateLoginField("password")}
                      placeholder="请输入密码"
                      className={`${loginErrors.password ? inputErrorCls : inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setLoginShowPwd(!loginShowPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-steam-text-dim hover:text-steam-text transition-colors"
                    >
                      {loginShowPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {loginErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {loginErrors.password}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-steam-blue text-steam-dark hover:bg-steam-blue-hover font-semibold rounded-sm"
                >
                  {loading ? "登录中..." : "登录"}
                </Button>
              </form>
            </TabsContent>

            {/* ---- 注册表单 ---- */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-steam-text mb-1">
                    用户名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={regForm.username}
                    onChange={(e) =>
                      setRegForm({ ...regForm, username: e.target.value })
                    }
                    onBlur={() => validateRegField("username")}
                    placeholder="请输入用户名（3-20位）"
                    className={regErrors.username ? inputErrorCls : inputCls}
                  />
                  {regErrors.username && (
                    <p className="text-xs text-red-500 mt-1">
                      {regErrors.username}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-steam-text mb-1">
                    邮箱（可选）
                  </label>
                  <input
                    type="email"
                    value={regForm.email}
                    onChange={(e) =>
                      setRegForm({ ...regForm, email: e.target.value })
                    }
                    onBlur={() => validateRegField("email")}
                    placeholder="请输入邮箱"
                    className={regErrors.email ? inputErrorCls : inputCls}
                  />
                  {regErrors.email && (
                    <p className="text-xs text-red-500 mt-1">
                      {regErrors.email}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-steam-text mb-1">
                    密码 <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={regShowPwd ? "text" : "password"}
                      value={regForm.password}
                      onChange={(e) =>
                        setRegForm({ ...regForm, password: e.target.value })
                      }
                      onBlur={() => validateRegField("password")}
                      placeholder="请输入密码（至少6位）"
                      className={`${regErrors.password ? inputErrorCls : inputCls} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setRegShowPwd(!regShowPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-steam-text-dim hover:text-steam-text transition-colors"
                    >
                      {regShowPwd ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {regErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {regErrors.password}
                    </p>
                  )}
                  {/* 密码强度条 */}
                  {regForm.password && (
                    <div className="mt-2 space-y-1">
                      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-steam-dark">
                        <div
                          className="h-full transition-all duration-300 rounded-full"
                          style={{
                            width: `${regStrength.value}%`,
                            backgroundColor: regStrength.cssColor,
                          }}
                        />
                      </div>
                      <p
                        className={`text-xs ${
                          regStrength.value <= 30
                            ? "text-red-500"
                            : regStrength.value <= 60
                              ? "text-yellow-500"
                              : "text-emerald-500"
                        }`}
                      >
                        密码强度：{regStrength.label}
                      </p>
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-steam-blue text-steam-dark hover:bg-steam-blue-hover font-semibold rounded-sm"
                >
                  {loading ? "注册中..." : "注册"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* 返回链接 */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-sm text-steam-text-dim hover:text-steam-blue transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              返回游戏商店
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
