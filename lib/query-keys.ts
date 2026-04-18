export const queryKeys = {
  categories: {
    all: ["categories"] as const,
  },
  games: {
    all: ["games"] as const,
    list: (filters: Record<string, any>) => ["games", "list", filters] as const,
    detail: (id: number) => ["games", "detail", id] as const,
    purchaseStatus: (id: number) => ["games", "purchaseStatus", id] as const,
  },
  favorites: {
    all: ["favorites"] as const,
  },
  signIn: {
    status: ["signIn", "status"] as const,
  },
  vip: {
    status: ["vip", "status"] as const,
  },
  user: {
    profile: ["user", "profile"] as const,
  },
};
