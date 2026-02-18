"use client";

import { QuestionImage } from "@/types/exam";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import ImageUploader from "./ImageUploader";

interface ImageListProps {
  images: QuestionImage[];
  onRemove: (id: string) => void;
  onReorder: (images: QuestionImage[]) => void;
  onImagesAdd: (files: File[]) => void;
  onClearAll: () => void;
}

export default function ImageList({
  images,
  onRemove,
  onReorder,
  onImagesAdd,
  onClearAll,
}: ImageListProps) {
  const moveImage = (index: number, direction: "left" | "right") => {
    const newImages = [...images];
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];

    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    onReorder(reordered);
  };

  return (
    <div>
      {images.length > 0 && (
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            {images.length}문항
          </span>
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            전체 삭제
          </button>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white"
          >
            {/* Number badge */}
            <div className="absolute top-1.5 left-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-[10px] font-bold text-white">
              {index + 1}
            </div>

            {/* Delete button */}
            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:bg-red-500 group-hover:opacity-100"
              aria-label="삭제"
            >
              <X className="h-3 w-3" />
            </button>

            {/* Image */}
            <div className="relative aspect-[3/4]">
              <img
                src={image.preview}
                alt={`${index + 1}번`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            {/* Reorder buttons */}
            <div className="flex border-t border-gray-100">
              <button
                onClick={() => moveImage(index, "left")}
                disabled={index === 0}
                className="flex flex-1 items-center justify-center py-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:text-gray-200"
                aria-label="앞으로"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <div className="w-px bg-gray-100" />
              <button
                onClick={() => moveImage(index, "right")}
                disabled={index === images.length - 1}
                className="flex flex-1 items-center justify-center py-1 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:text-gray-200"
                aria-label="뒤로"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Add more - inline compact uploader */}
        <ImageUploader onImagesAdd={onImagesAdd} compact />
      </div>
    </div>
  );
}
