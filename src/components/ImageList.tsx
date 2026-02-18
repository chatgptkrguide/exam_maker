"use client";

import { QuestionImage } from "@/types/exam";
import { X, ChevronUp, ChevronDown } from "lucide-react";

interface ImageListProps {
  images: QuestionImage[];
  onRemove: (id: string) => void;
  onReorder: (images: QuestionImage[]) => void;
}

export default function ImageList({
  images,
  onRemove,
  onReorder,
}: ImageListProps) {
  const moveImage = (index: number, direction: "up" | "down") => {
    const newImages = [...images];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newImages.length) return;

    [newImages[index], newImages[targetIndex]] = [
      newImages[targetIndex],
      newImages[index],
    ];

    const reordered = newImages.map((img, i) => ({ ...img, order: i }));
    onReorder(reordered);
  };

  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          업로드된 이미지
        </h2>
        <p className="py-8 text-center text-sm text-gray-500">
          아직 업로드된 이미지가 없습니다. 위에서 이미지를 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        업로드된 이미지 ({images.length}장)
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative overflow-hidden rounded-lg border border-gray-200"
          >
            <div className="absolute top-2 left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
              {index + 1}
            </div>

            <button
              onClick={() => onRemove(image.id)}
              className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
              aria-label="삭제"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            <div className="relative aspect-square">
              <img
                src={image.preview}
                alt={`문제 이미지 ${index + 1}`}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>

            <div className="flex border-t border-gray-200">
              <button
                onClick={() => moveImage(index, "up")}
                disabled={index === 0}
                className="flex flex-1 items-center justify-center py-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="위로 이동"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <div className="w-px bg-gray-200" />
              <button
                onClick={() => moveImage(index, "down")}
                disabled={index === images.length - 1}
                className="flex flex-1 items-center justify-center py-1.5 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-300"
                aria-label="아래로 이동"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
