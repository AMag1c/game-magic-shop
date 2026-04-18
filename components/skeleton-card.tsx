import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  variant?: "portrait" | "landscape";
  className?: string;
}

export function SkeletonCard({ variant = "portrait", className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl overflow-hidden",
        variant === "portrait" ? "aspect-[3/4]" : "aspect-video",
        className
      )}
    >
      <Skeleton className="w-full h-full" />
    </div>
  );
}
