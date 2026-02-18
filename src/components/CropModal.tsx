"use client";

import { useState, useRef, useCallback } from "react";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { getCroppedImage } from "@/lib/image";
import { X, Check, RotateCcw } from "lucide-react";

interface CropModalProps {
  imageSrc: string;
  onComplete: (croppedUrl: string) => void;
  onClose: () => void;
}

export default function CropModal({
  imageSrc,
  onComplete,
  onClose,
}: CropModalProps) {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const imgRef = useRef<HTMLImageElement>(null);

  const handleConfirm = useCallback(async () => {
    if (!imgRef.current || !completedCrop) return;
    const url = await getCroppedImage(imgRef.current, completedCrop);
    onComplete(url);
  }, [completedCrop, onComplete]);

  const handleReset = () => {
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-4">
      <div className="flex max-h-[95vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl overflow-hidden sm:max-h-[90vh] sm:max-w-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <span className="text-sm font-semibold text-gray-900">
            이미지 자르기
          </span>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors sm:h-7 sm:w-7"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Crop area */}
        <div className="flex flex-1 items-center justify-center overflow-auto bg-gray-50 p-3 sm:p-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="자르기"
              style={{ maxHeight: "55vh", maxWidth: "100%" }}
            />
          </ReactCrop>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3 safe-area-bottom">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            초기화
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 px-4 py-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50 active:bg-gray-100 transition-colors sm:py-2"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={!completedCrop}
              className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2.5 text-xs font-medium text-white hover:bg-blue-700 active:bg-blue-800 disabled:opacity-40 transition-colors sm:py-2"
            >
              <Check className="h-3.5 w-3.5" />
              적용
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
