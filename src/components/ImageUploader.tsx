"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Plus, ImagePlus } from "lucide-react";

interface ImageUploaderProps {
  onImagesAdd: (files: File[]) => void;
  compact?: boolean;
}

export default function ImageUploader({
  onImagesAdd,
  compact,
}: ImageUploaderProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onImagesAdd(acceptedFiles);
      }
    },
    [onImagesAdd]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  if (compact) {
    return (
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors aspect-[3/4] ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 active:bg-blue-50"
        }`}
      >
        <input {...getInputProps()} />
        <Plus className="h-6 w-6 text-gray-300 sm:h-8 sm:w-8" />
        <span className="mt-0.5 text-[10px] text-gray-400 sm:text-xs">
          추가
        </span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-10 transition-colors sm:py-12 ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50 active:bg-blue-50"
      }`}
    >
      <input {...getInputProps()} />
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 sm:h-14 sm:w-14">
        <ImagePlus className="h-6 w-6 text-blue-500 sm:h-7 sm:w-7" />
      </div>
      {isDragActive ? (
        <p className="mt-3 text-xs font-medium text-blue-600 sm:text-sm">
          여기에 놓으세요
        </p>
      ) : (
        <>
          <p className="mt-3 text-xs font-medium text-gray-700 sm:text-sm">
            사진을 추가하세요
          </p>
          <p className="mt-1 text-[10px] text-gray-400 sm:text-xs">
            탭하여 촬영/선택 &middot; 여러 장 가능
          </p>
        </>
      )}
    </div>
  );
}
