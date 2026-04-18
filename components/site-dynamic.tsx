"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";

interface DynamicItem {
  user: string;
  action: string;
  time: string;
}

// 模拟动态数据，后续可替换为真实 API
function generateMockData(): DynamicItem[] {
  const names = ["新*户", "菠*东", "c*******t", "游*者", "小*明", "大*哥", "路*人"];
  const actions = [
    "签到打卡成功，获得奖励：1.0游戏币",
    "成功登录了本站",
    "签到打卡成功，获得奖励：1.0游戏币",
    "成功登录了本站",
    "购买了一款游戏",
    "签到打卡成功，获得奖励：1.0游戏币",
    "成功登录了本站",
    "成为了新会员",
  ];
  const times = ["1 分前", "3 分前", "6 分前", "7 分前", "17 分前", "37 分前", "54 分前", "1 小时前"];

  return Array.from({ length: 10 }, (_, i) => ({
    user: names[i % names.length],
    action: actions[i % actions.length],
    time: times[i % times.length],
  }));
}

export function SiteDynamic() {
  const [items] = useState(generateMockData);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="flex items-center bg-steam-medium/60 rounded px-3 py-2 text-xs overflow-hidden">
      {/* 左侧标签 */}
      <span className="hidden lg:flex items-center gap-1.5 flex-shrink-0 mr-3">
        <span className="flex items-center gap-1 bg-red-500/80 text-white px-2 py-0.5 rounded text-[11px] font-medium">
          <Volume2 className="w-3 h-3" />
          网站动态
          <span className="relative flex h-1.5 w-1.5 ml-0.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
          </span>
        </span>
      </span>

      {/* 滚动动态 */}
      <div ref={containerRef} className="flex-1 relative h-[20px] overflow-hidden">
        {items.map((item, i) => (
          <div
            key={i}
            className="absolute inset-x-0 flex items-center gap-1 transition-all duration-500 ease-in-out text-steam-text-dim"
            style={{
              transform: `translateY(${(i - currentIndex) * 100}%)`,
              opacity: i === currentIndex ? 1 : 0,
            }}
          >
            <span className="text-steam-text">{item.user}</span>
            <span className="font-medium text-steam-text">{item.action}</span>
            <span className="ml-auto flex-shrink-0 bg-steam-light/30 px-1.5 py-0.5 rounded text-[10px]">
              {item.time}
            </span>
          </div>
        ))}
      </div>

      {/* 右侧统计 */}
      <div className="hidden lg:flex items-center gap-3 flex-shrink-0 ml-3 text-steam-text-dim">
        <span>
          今日发布 <span className="bg-steam-blue/20 text-steam-blue px-1 py-0.5 rounded text-[10px] ml-0.5">0</span>
        </span>
        <span>
          本周 <span className="bg-steam-blue/20 text-steam-blue px-1 py-0.5 rounded text-[10px] ml-0.5">130</span>
        </span>
        <span>
          总数 <span className="bg-steam-blue/20 text-steam-blue px-1 py-0.5 rounded text-[10px] ml-0.5">18239</span>
        </span>
      </div>
    </div>
  );
}
