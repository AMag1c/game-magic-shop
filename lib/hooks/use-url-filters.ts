"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

interface Filters {
  cat: string;
  price: string;
  sort: string;
  q: string;
  page: number;
}

export function useUrlFilters(): {
  filters: Filters;
  setFilter: (key: keyof Filters, value: string | number) => void;
  resetFilters: () => void;
} {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const filters: Filters = {
    cat: searchParams.get("cat") || "all",
    price: searchParams.get("price") || "all",
    sort: searchParams.get("sort") || "",
    q: searchParams.get("q") || "",
    page: Number(searchParams.get("page")) || 1,
  };

  const setFilter = useCallback(
    (key: keyof Filters, value: string | number) => {
      const params = new URLSearchParams(searchParams.toString());
      const strValue = String(value);

      if (!strValue || strValue === "all" || strValue === "0" || strValue === "1") {
        params.delete(key);
      } else {
        params.set(key, strValue);
      }

      // 切换筛选时重置页码
      if (key !== "page") {
        params.delete("page");
      }

      const query = params.toString();
      router.replace(`${pathname}${query ? `?${query}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return { filters, setFilter, resetFilters };
}
