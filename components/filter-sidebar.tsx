"use client";

import { Gamepad2, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCategories } from "@/lib/hooks/use-categories";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const PRICE_OPTIONS = [
  { label: "全部", value: "all" },
  { label: "免费", value: "free" },
  { label: "付费", value: "paid" },
  { label: "会员价", value: "member" },
];

const SORT_OPTIONS = [
  { label: "综合", value: "" },
  { label: "热度", value: "downloads" },
  { label: "评分", value: "rating" },
  { label: "最新", value: "newest" },
];

interface FilterSidebarProps {
  selectedCat: string;
  selectedPrice: string;
  selectedSort: string;
  onCatChange: (cat: string) => void;
  onPriceChange: (price: string) => void;
  onSortChange: (sort: string) => void;
}

function FilterContent({
  selectedCat, selectedPrice, selectedSort,
  onCatChange, onPriceChange, onSortChange,
}: FilterSidebarProps) {
  const { data: categories } = useCategories();

  return (
    <div className="space-y-6">
      {/* 分类 */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">游戏分类</h3>
        <div className="space-y-1">
          <button
            onClick={() => onCatChange("all")}
            className={cn(
              "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
              selectedCat === "all" ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-white/10"
            )}
          >
            <Gamepad2 className="w-4 h-4 inline mr-2" />
            全部游戏
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCatChange(cat.name)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                selectedCat === cat.name ? "bg-primary text-primary-foreground" : "text-foreground/80 hover:bg-white/10"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* 价格 */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">价格筛选</h3>
        <div className="space-y-1">
          {PRICE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onPriceChange(opt.value)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                selectedPrice === opt.value ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-white/10"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* 排序 */}
      <div>
        <h3 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">排序方式</h3>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onSortChange(opt.value)}
              className={cn(
                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer",
                selectedSort === opt.value ? "bg-primary/10 text-primary" : "text-foreground/80 hover:bg-white/10"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function FilterSidebar(props: FilterSidebarProps) {
  return (
    <>
      {/* 桌面端: sticky 侧边栏 */}
      <aside className="hidden lg:block w-60 flex-shrink-0">
        <div className="sticky top-20 bg-card rounded-xl border border-border/50 p-4">
          <FilterContent {...props} />
        </div>
      </aside>

      {/* 移动端: Sheet 按钮 */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer">
              <Filter className="w-4 h-4 mr-2" />
              筛选
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>筛选</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <FilterContent {...props} />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
