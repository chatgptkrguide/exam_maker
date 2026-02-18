"use client";

import { useState } from "react";
import { QuestionImage } from "@/types/exam";
import { X, ChevronLeft, ChevronRight, Trash2, Crop, Sun } from "lucide-react";
import ImageUploader from "./ImageUploader";
import CropModal from "./CropModal";
import { matchBackground } from "@/lib/image";

interface ImageListProps {
  images: QuestionImage[];
  onRemove: (id: string) => void;
  onReorder: (images: QuestionImage[]) => void;
  onImagesAdd: (files: File[]) => void;
  onClearAll: () => void;
  onUpdatePreview: (id: string, newPreview: string) => void;
}

export default function ImageList({
  images,
  onRemove,
  onReorder,
  onImagesAdd,
  onClearAll,
  onUpdatePreview,
}: ImageListProps) {
  const [cropTarget, setCropTarget] = useState<QuestionImage | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

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

  const handleCropComplete = (croppedUrl: string) => {
    if (!cropTarget) return;
    onUpdatePreview(cropTarget.id, croppedUrl);
    setCropTarget(null);
  };

  const handleMatchBg = async (image: QuestionImage) => {
    setProcessingId(image.id);
    try {
      const newUrl = await matchBackground(image.preview);
      onUpdatePreview(image.id, newUrl);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <>
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

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
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
                {processingId === image.id && (
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
                  className="flex flex-1 items-center justify-center py-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:text-gray-200"
                  title="앞으로"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => setCropTarget(image)}
                  className="flex flex-1 items-center justify-center py-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
                  title="자르기"
                >
                  <Crop className="h-3.5 w-3.5" />
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => handleMatchBg(image)}
                  disabled={processingId === image.id}
                  className="flex flex-1 items-center justify-center py-1.5 text-gray-400 transition-colors hover:bg-amber-50 hover:text-amber-500 disabled:text-gray-200"
                  title="배경 보정"
                >
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <div className="w-px bg-gray-100" />
                <button
                  onClick={() => moveImage(index, "right")}
                  disabled={index === images.length - 1}
                  className="flex flex-1 items-center justify-center py-1.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600 disabled:text-gray-200"
                  title="뒤로"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {/* Add more */}
          <ImageUploader onImagesAdd={onImagesAdd} compact />
        </div>
      </div>

      {/* Crop modal */}
      {cropTarget && (
        <CropModal
          imageSrc={cropTarget.preview}
          onComplete={handleCropComplete}
          onClose={() => setCropTarget(null)}
        />
      )}
    </>
  );
}
