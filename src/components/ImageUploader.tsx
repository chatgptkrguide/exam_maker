"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Plus } from "lucide-react";

interface ImageUploaderProps {
  onImagesAdd: (files: File[]) => void;
  compact?: boolean;
}

export default function ImageUploader({ onImagesAdd, compact }: ImageUploaderProps) {
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
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors aspect-square ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
        }`}
      >
        <input {...getInputProps()} capture="environment" />
        <Plus className="h-8 w-8 text-gray-300" />
        <span className="mt-1 text-xs text-gray-400">추가</span>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed py-12 transition-colors ${
        isDragActive
          ? "border-blue-500 bg-blue-50"
          : "border-gray-200 hover:border-blue-400 hover:bg-blue-50/50"
      }`}
    >
      <input {...getInputProps()} capture="environment" />
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50">
        <Plus className="h-7 w-7 text-blue-500" />
      </div>
      {isDragActive ? (
        <p className="mt-3 text-sm font-medium text-blue-600">
          여기에 놓으세요
        </p>
      ) : (
        <>
          <p className="mt-3 text-sm font-medium text-gray-700">
            사진을 추가하세요
          </p>
          <p className="mt-1 text-xs text-gray-400">
            클릭 또는 드래그 &middot; 여러 장 가능
          </p>
        </>
      )}
    </div>
  );
}
