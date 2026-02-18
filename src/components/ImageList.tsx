"use client";

import { memo, useState, useCallback } from "react";
import { QuestionImage } from "@/types/exam";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Crop,
  Sun,
  Loader2,
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
            className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
          >
            {/* Number badge */}
            <div className="absolute top-1 left-1 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
              {index + 1}
            </div>
            {/* Delete button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1 right-1 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white transition-all active:bg-red-500 sm:h-5 sm:w-5 sm:opacity-0 sm:group-hover:opacity-100 sm:hover:bg-red-500"
            >
              <X className="h-3 w-3" />
            </button>
            {/* Image */}
            <div className="relative aspect-[3/4]">
              <img
                src={image.preview}
                alt={`${index + 1}번`}
                className="absolute inset-0 h-full w-full object-cover"
                loading="lazy"
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
                className="flex flex-1 items-center justify-center py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => onCropRequest(image)}
                className="flex flex-1 items-center justify-center py-1.5 text-gray-400 hover:bg-blue-50 active:bg-blue-100"
              >
                <Crop className="h-3.5 w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => handleMatchBg(image)}
                disabled={processingId === image.id}
                className="flex flex-1 items-center justify-center py-1.5 text-gray-400 hover:bg-amber-50 active:bg-amber-100 disabled:text-gray-200"
              >
                <Sun className="h-3.5 w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => moveImage(index, "right")}
                disabled={index === images.length - 1}
                className="flex flex-1 items-center justify-center py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 disabled:text-gray-200"
              >
                <ChevronRight className="h-3.5 w-3.5" />
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
