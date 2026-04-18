"use client";

import { useState } from "react";
import { X, Volume2 } from "lucide-react";

export function SiteAnnouncement() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-steam-light/40 border border-steam-blue/30 rounded px-4 py-3 text-sm text-steam-text relative">
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-steam-text-dim hover:text-white transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-2 pr-6">
        <Volume2 className="w-4 h-4 text-steam-blue flex-shrink-0 mt-0.5" />
        <div className="space-y-1 text-[13px] leading-relaxed">
          <p>
            <span className="text-steam-blue font-medium">1.</span>{" "}
            本站已更新，最近更新时间：2025/10/14，游戏总数 12400+
          </p>
          <p>
            <span className="text-steam-blue font-medium">2.</span>{" "}
            低价薅羊毛群，每天都有大量神车，群号：389976900{" "}
            <a
              href="https://jq.qq.com/?_wv=1027&k=7XplUkhK"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block ml-1 px-2 py-0.5 bg-steam-blue/20 text-steam-blue hover:bg-steam-blue/30 rounded text-xs transition-colors"
            >
              点我加群
            </a>
          </p>
          <p>
            <span className="text-steam-blue font-medium">3.</span>{" "}
            你也想推广赚钱吗？加入我们的团队，站长提供技术支持，开启赚钱之旅！
          </p>
        </div>
      </div>
    </div>
  );
}
