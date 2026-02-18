"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, Camera } from "lucide-react";

interface ImageUploaderProps {
  onImagesAdd: (files: File[]) => void;
}

export default function ImageUploader({ onImagesAdd }: ImageUploaderProps) {
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">
        문제 이미지 업로드
      </h2>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
        }`}
      >
        <input {...getInputProps()} capture="environment" />
        <div className="flex items-center gap-3 text-gray-400">
          <Upload className="h-8 w-8" />
          <Camera className="h-8 w-8" />
        </div>
        {isDragActive ? (
          <p className="mt-3 text-sm font-medium text-blue-600">
            여기에 이미지를 놓으세요
          </p>
        ) : (
          <>
            <p className="mt-3 text-sm font-medium text-gray-700">
              이미지를 드래그하거나 클릭하여 업로드
            </p>
            <p className="mt-1 text-xs text-gray-500">
              카메라 촬영 또는 갤러리에서 선택 가능 (여러 장 동시 업로드 가능)
            </p>
          </>
        )}
      </div>
    </div>
  );
}
