"use client";

import { useState, useRef, useCallback } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";
import ExamHeader from "@/components/ExamHeader";
import ImageUploader from "@/components/ImageUploader";
import ImageList from "@/components/ImageList";
import ExamPreview from "@/components/ExamPreview";
import { generatePdf } from "@/lib/pdf";
import { loadImageDimensions, matchBackground } from "@/lib/image";
import { FileDown, Loader2, PenLine, Eye } from "lucide-react";

export default function Home() {
  const [headerInfo, setHeaderInfo] = useState<ExamHeaderInfo>({
    schoolName: "",
    examTitle: "",
    subject: "",
    grade: "",
    date: "",
    timeLimit: "",
    teacherName: "",
    totalQuestions: 0,
  });

  const [images, setImages] = useState<QuestionImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isMatchingAll, setIsMatchingAll] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const livePreviewRef = useRef<HTMLDivElement | null>(null);

  const handleImagesAdd = useCallback(async (files: File[]) => {
    const newImages: QuestionImage[] = await Promise.all(
      files.map(async (file, index) => {
        const preview = URL.createObjectURL(file);
        const dims = await loadImageDimensions(preview);
        return {
          id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview,
          order: 0,
          width: dims.width,
          height: dims.height,
        };
      })
    );
    setImages((prev) =>
      [...prev, ...newImages].map((img, i) => ({ ...img, order: i }))
    );
  }, []);

  const handleRemove = useCallback((id: string) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id);
      if (target) URL.revokeObjectURL(target.preview);
      return prev
        .filter((img) => img.id !== id)
        .map((img, i) => ({ ...img, order: i }));
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setImages((prev) => {
      prev.forEach((img) => URL.revokeObjectURL(img.preview));
      return [];
    });
  }, []);

  const handleReorder = useCallback((reordered: QuestionImage[]) => {
    setImages(reordered);
  }, []);

  const handleUpdatePreview = useCallback(
    async (id: string, newPreview: string) => {
      const dims = await loadImageDimensions(newPreview);
      setImages((prev) =>
        prev.map((img) => {
          if (img.id === id) {
            URL.revokeObjectURL(img.preview);
            return {
              ...img,
              preview: newPreview,
              width: dims.width,
              height: dims.height,
            };
          }
          return img;
        })
      );
    },
    []
  );

  const handleMatchAllBg = useCallback(async () => {
    setIsMatchingAll(true);
    try {
      const updated = await Promise.all(
        images.map(async (img) => {
          const newPreview = await matchBackground(img.preview);
          const dims = await loadImageDimensions(newPreview);
          URL.revokeObjectURL(img.preview);
          return { ...img, preview: newPreview, width: dims.width, height: dims.height };
        })
      );
      setImages(updated);
    } finally {
      setIsMatchingAll(false);
    }
  }, [images]);

  const handleDownloadPdf = async () => {
    if (!pdfRef.current) return;
    setIsGenerating(true);
    try {
      const filename = headerInfo.subject
        ? `${headerInfo.schoolName || "시험지"}_${headerInfo.subject}.pdf`
        : "시험지.pdf";
      await generatePdf(pdfRef.current, filename);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasImages = images.length > 0;

  return (
    <div className="flex h-dvh flex-col bg-gray-50">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 shrink-0 sm:px-4">
        <h1 className="text-sm font-bold text-gray-900 sm:text-base truncate mr-2">
          시험지 제작기
        </h1>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Mobile tab toggle */}
          {hasImages && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 md:hidden">
              <button
                onClick={() => setMobileTab("edit")}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  mobileTab === "edit"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 active:bg-gray-100"
                }`}
              >
                <PenLine className="h-3 w-3" />
                편집
              </button>
              <button
                onClick={() => setMobileTab("preview")}
                className={`flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium transition-colors ${
                  mobileTab === "preview"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 active:bg-gray-100"
                }`}
              >
                <Eye className="h-3 w-3" />
                미리보기
              </button>
            </div>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={!hasImages || isGenerating}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-blue-700 active:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-1.5 sm:px-3.5 sm:py-2 sm:text-sm"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
            {isGenerating ? "생성 중..." : "PDF 저장"}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Editor */}
        <div
          className={`w-full flex-col overflow-y-auto panel-scroll bg-white p-3 sm:p-4 md:w-2/5 md:max-w-[420px] md:min-w-[320px] md:shrink-0 md:border-r md:border-gray-200 ${
            mobileTab === "preview" && hasImages ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="space-y-3">
            <ExamHeader headerInfo={headerInfo} onChange={setHeaderInfo} />
            {!hasImages ? (
              <ImageUploader onImagesAdd={handleImagesAdd} />
            ) : (
              <ImageList
                images={images}
                onRemove={handleRemove}
                onReorder={handleReorder}
                onImagesAdd={handleImagesAdd}
                onClearAll={handleClearAll}
                onUpdatePreview={handleUpdatePreview}
                onMatchAllBg={handleMatchAllBg}
                isMatchingAll={isMatchingAll}
              />
            )}
          </div>
        </div>

        {/* Right panel - Live preview */}
        <div
          className={`flex-1 overflow-auto panel-scroll bg-gray-100 ${
            mobileTab === "preview" && hasImages ? "block" : "hidden md:block"
          }`}
        >
          {hasImages ? (
            <div className="flex justify-center px-3 py-4 sm:px-6 sm:py-6">
              <div style={{ zoom: "var(--preview-scale, 0.4)" }}>
                <ExamPreview
                  headerInfo={headerInfo}
                  images={images}
                  previewRef={livePreviewRef}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-4">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 sm:h-14 sm:w-14">
                  <FileDown className="h-5 w-5 text-gray-400 sm:h-6 sm:w-6" />
                </div>
                <p className="text-xs text-gray-400 sm:text-sm leading-relaxed">
                  사진을 추가하면
                  <br />
                  미리보기가 표시됩니다
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden preview for PDF generation */}
      <div className="fixed" style={{ left: "-9999px", top: 0 }}>
        <ExamPreview
          headerInfo={headerInfo}
          images={images}
          previewRef={pdfRef}
        />
      </div>
    </div>
  );
}
