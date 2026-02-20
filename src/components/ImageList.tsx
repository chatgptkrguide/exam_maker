"use client";

import { memo, useState, useCallback, useRef } from "react";
import { QuestionImage } from "@/types/exam";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Crop,
  Sun,
  Loader2,
  GripVertical,
} from "lucide-react";
import ImageUploader from "./ImageUploader";
import { matchBackground } from "@/lib/image";

interface ImageListProps {
  images: QuestionImage[];
  onRemove: (id: string) => void;
  onReorder: (images: QuestionImage[]) => void;
  onImagesAdd: (files: File[]) => void;
  onClearAll: () => void;
  onUpdatePreview: (id: string, newPreview: string) => void;
  onMatchAllBg: () => void;
  isMatchingAll: boolean;
  onCropRequest: (image: QuestionImage) => void;
}

const ImageList = memo(function ImageList({
  images,
  onRemove,
  onReorder,
  onImagesAdd,
  onClearAll,
  onUpdatePreview,
  onMatchAllBg,
  isMatchingAll,
  onCropRequest,
}: ImageListProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Touch drag state
  const touchState = useRef<{
    index: number;
    startY: number;
    startX: number;
    clone: HTMLElement | null;
    active: boolean;
    timer: ReturnType<typeof setTimeout> | null;
  } | null>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const moveImage = useCallback(
    (index: number, direction: "left" | "right") => {
      const newImages = [...images];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= newImages.length) return;
      [newImages[index], newImages[targetIndex]] = [
        newImages[targetIndex],
        newImages[index],
      ];
      onReorder(newImages.map((img, i) => ({ ...img, order: i })));
    },
    [images, onReorder]
  );

  const handleMatchBg = useCallback(
    async (image: QuestionImage) => {
      setProcessingId(image.id);
      try {
        const newUrl = await matchBackground(image.preview);
        onUpdatePreview(image.id, newUrl);
      } catch {
        // silently fail for individual image
      } finally {
        setProcessingId(null);
      }
    },
    [onUpdatePreview]
  );

  // --- HTML5 Drag & Drop (desktop) ---
  const handleDragStart = useCallback(
    (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = "move";
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
      setDragOverIndex(index);
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null || draggedIndex === dropIndex) {
        setDraggedIndex(null);
        setDragOverIndex(null);
        return;
      }
      const newImages = [...images];
      const [dragged] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, dragged);
      onReorder(newImages.map((img, i) => ({ ...img, order: i })));
      setDraggedIndex(null);
      setDragOverIndex(null);
    },
    [draggedIndex, images, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // --- Touch Drag (mobile) ---
  const findTouchTarget = useCallback((x: number, y: number): number | null => {
    for (let i = 0; i < cardRefs.current.length; i++) {
      const el = cardRefs.current[i];
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return i;
      }
    }
    return null;
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent, index: number) => {
    const touch = e.touches[0];
    touchState.current = {
      index,
      startX: touch.clientX,
      startY: touch.clientY,
      clone: null,
      active: false,
      timer: setTimeout(() => {
        if (!touchState.current) return;
        touchState.current.active = true;
        if (navigator.vibrate) navigator.vibrate(30);
        setDraggedIndex(index);

        // Create floating clone
        const card = cardRefs.current[index];
        if (card) {
          const rect = card.getBoundingClientRect();
          const clone = card.cloneNode(true) as HTMLElement;
          clone.style.position = "fixed";
          clone.style.width = `${rect.width}px`;
          clone.style.height = `${rect.height}px`;
          clone.style.left = `${rect.left}px`;
          clone.style.top = `${rect.top}px`;
          clone.style.zIndex = "9999";
          clone.style.opacity = "0.85";
          clone.style.transform = "scale(1.05)";
          clone.style.boxShadow = "0 8px 25px rgba(0,0,0,0.2)";
          clone.style.pointerEvents = "none";
          clone.style.transition = "transform 0.1s, box-shadow 0.1s";
          clone.style.borderRadius = "8px";
          document.body.appendChild(clone);
          touchState.current.clone = clone;
        }
      }, 200),
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchState.current) return;
      const touch = e.touches[0];

      if (!touchState.current.active) {
        // Cancel if moved too far before long-press activates
        const dx = touch.clientX - touchState.current.startX;
        const dy = touch.clientY - touchState.current.startY;
        if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
          if (touchState.current.timer) clearTimeout(touchState.current.timer);
          touchState.current = null;
          return;
        }
        return;
      }

      e.preventDefault();

      // Move clone
      if (touchState.current.clone) {
        const card = cardRefs.current[touchState.current.index];
        if (card) {
          const rect = card.getBoundingClientRect();
          const dx = touch.clientX - touchState.current.startX;
          const dy = touch.clientY - touchState.current.startY;
          touchState.current.clone.style.left = `${rect.left + dx}px`;
          touchState.current.clone.style.top = `${rect.top + dy}px`;
        }
      }

      // Find target
      const target = findTouchTarget(touch.clientX, touch.clientY);
      setDragOverIndex(target !== touchState.current.index ? target : null);
    },
    [findTouchTarget]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchState.current) return;

    if (touchState.current.timer) clearTimeout(touchState.current.timer);

    if (touchState.current.active && dragOverIndex !== null && dragOverIndex !== touchState.current.index) {
      const fromIndex = touchState.current.index;
      const newImages = [...images];
      const [dragged] = newImages.splice(fromIndex, 1);
      newImages.splice(dragOverIndex, 0, dragged);
      onReorder(newImages.map((img, i) => ({ ...img, order: i })));
    }

    // Cleanup clone
    if (touchState.current.clone) {
      touchState.current.clone.remove();
    }

    touchState.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [dragOverIndex, images, onReorder]);

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium text-gray-700">
            {images.length}문항
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onMatchAllBg}
              disabled={isMatchingAll}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors disabled:opacity-50 sm:text-xs"
            >
              {isMatchingAll ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Sun className="h-3 w-3" />
              )}
              <span className="hidden xs:inline">
                {isMatchingAll ? "보정 중..." : "전체 배경 보정"}
              </span>
              <span className="xs:hidden">
                {isMatchingAll ? "보정중" : "배경보정"}
              </span>
            </button>
            <button
              onClick={onClearAll}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-red-400 hover:bg-red-50 active:bg-red-100 transition-colors sm:text-xs"
            >
              <Trash2 className="h-3 w-3" />
              <span className="hidden xs:inline">전체 삭제</span>
              <span className="xs:hidden">삭제</span>
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-1.5 xs:grid-cols-3 sm:gap-2">
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={(el) => { cardRefs.current[index] = el; }}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={() => setDragOverIndex(null)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            onTouchStart={(e) => handleTouchStart(e, index)}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            className={`group relative overflow-hidden rounded-lg border bg-white select-none transition-all duration-150 ${
              draggedIndex === index
                ? "opacity-40 scale-95 border-blue-400 ring-1 ring-blue-200"
                : dragOverIndex === index
                ? "border-blue-500 ring-2 ring-blue-200 scale-[1.03]"
                : "border-gray-200"
            }`}
          >
            {/* Drag handle indicator */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]" />
            </div>
            {/* Number badge */}
            <div className="absolute top-1 left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
              {index + 1}
            </div>
            {/* Delete button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-all active:bg-red-500 sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:bg-red-500"
            >
              <X className="h-3.5 w-3.5 sm:h-3 sm:w-3" />
            </button>
            {/* Image */}
            <div className="relative aspect-[3/4] cursor-grab active:cursor-grabbing">
              <img
                src={image.preview}
                alt={`${index + 1}번`}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                loading="lazy"
                draggable={false}
              />
              {(processingId === image.id || isMatchingAll) && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                </div>
              )}
            </div>
            {/* Action buttons */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => moveImage(index, "left")}
                disabled={index === 0}
                className="flex flex-1 items-center justify-center min-h-[44px] sm:min-h-0 sm:py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200"
              >
                <ChevronLeft className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => onCropRequest(image)}
                className="flex flex-1 items-center justify-center min-h-[44px] sm:min-h-0 sm:py-1.5 text-gray-400 hover:bg-blue-50 active:bg-blue-100"
              >
                <Crop className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => handleMatchBg(image)}
                disabled={processingId === image.id}
                className="flex flex-1 items-center justify-center min-h-[44px] sm:min-h-0 sm:py-1.5 text-gray-400 hover:bg-amber-50 active:bg-amber-100 disabled:text-gray-200"
              >
                <Sun className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => moveImage(index, "right")}
                disabled={index === images.length - 1}
                className="flex flex-1 items-center justify-center min-h-[44px] sm:min-h-0 sm:py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200"
              >
                <ChevronRight className="h-5 w-5 sm:h-3.5 sm:w-3.5" />
              </button>
            </div>
          </div>
        ))}
        <ImageUploader onImagesAdd={onImagesAdd} compact />
      </div>
    </div>
  );
});

export default ImageList;
