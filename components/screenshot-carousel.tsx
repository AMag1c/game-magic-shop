"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, X, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ScreenshotCarouselProps {
  images: string[];
  videoUrl?: string;
  gameName: string;
}

export function ScreenshotCarousel({ images, videoUrl, gameName }: ScreenshotCarouselProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start" });

  const allMedia = videoUrl ? ["__video__", ...images] : images;

  const scrollTo = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  if (allMedia.length === 0) return null;

  const currentIsVideo = allMedia[selectedIndex] === "__video__";

  return (
    <div className="space-y-3">
      {/* 主显示区 */}
      <div
        className="relative aspect-video rounded-lg overflow-hidden bg-muted cursor-pointer group"
        onClick={() => !currentIsVideo && setLightboxOpen(true)}
      >
        {currentIsVideo ? (
          <video
            muted
            autoPlay
            controls
            className="w-full h-full object-cover"
            src={videoUrl}
          />
        ) : (
          <>
            <Image
              src={allMedia[selectedIndex]}
              alt={`${gameName} 截图 ${selectedIndex + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                点击放大
              </span>
            </div>
          </>
        )}
      </div>

      {/* 缩略图条 */}
      {allMedia.length > 1 && (
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-2">
            {allMedia.map((src, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "flex-none w-20 h-14 rounded-md overflow-hidden bg-muted relative cursor-pointer transition-all",
                  selectedIndex === index
                    ? "ring-2 ring-primary opacity-100"
                    : "opacity-60 hover:opacity-90"
                )}
              >
                {src === "__video__" ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-5 h-5 text-muted-foreground" />
                  </div>
                ) : (
                  <Image src={src} alt="" fill className="object-cover" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border-none">
          <div className="relative aspect-video">
            <Image
              src={allMedia[selectedIndex] === "__video__" ? (images[0] || "") : allMedia[selectedIndex]}
              alt=""
              fill
              className="object-contain"
            />
          </div>
          {/* 导航 */}
          {allMedia.length > 1 && (
            <>
              <button
                onClick={() => setSelectedIndex((p) => (p - 1 + allMedia.length) % allMedia.length)}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setSelectedIndex((p) => (p + 1) % allMedia.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {selectedIndex + 1} / {allMedia.length}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
