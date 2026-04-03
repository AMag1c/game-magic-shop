// 排序选项（分类页和搜索页共用）
export const SORT_OPTIONS = [
  { label: "默认排序", value: "default" },
  { label: "最新上架", value: "newest" },
  { label: "最多下载", value: "downloads" },
  { label: "评分最高", value: "rating" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
