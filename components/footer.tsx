import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  return (
    <footer className="bg-steam-dark border-t border-white/5 mt-auto hidden md:block">
      <div className="max-w-[1200px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between text-[11px] text-steam-text-dim">
          <div className="flex items-center gap-4">
            <span className="text-steam-blue font-bold text-sm">GAMESHOP</span>
            <Separator orientation="vertical" className="h-3 bg-white/10" />
            <Link href="/" className="hover:text-steam-text transition-colors">商店</Link>
            <Link href="/category" className="hover:text-steam-text transition-colors">分类</Link>
            <Link href="/sign-in" className="hover:text-steam-text transition-colors">签到</Link>
            <Link href="/vip" className="hover:text-steam-text transition-colors">VIP</Link>
          </div>
          <span>&copy; 2025 GameShop. 仅供学习交流使用。</span>
        </div>
      </div>
    </footer>
  );
}
