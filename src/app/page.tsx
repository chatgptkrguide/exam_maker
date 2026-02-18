"use client";

import { useState, useRef, useCallback } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";
import ExamHeader from "@/components/ExamHeader";
import ImageUploader from "@/components/ImageUploader";
import ImageList from "@/components/ImageList";
import ExamPreview from "@/components/ExamPreview";
import { generatePdf } from "@/lib/pdf";
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
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const livePreviewRef = useRef<HTMLDivElement | null>(null);

  const handleImagesAdd = useCallback((files: File[]) => {
    const newImages: QuestionImage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      order: 0,
    }));
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

  const handleUpdatePreview = useCallback((id: string, newPreview: string) => {
    setImages((prev) =>
      prev.map((img) => {
        if (img.id === id) {
          URL.revokeObjectURL(img.preview);
          return { ...img, preview: newPreview };
        }
        return img;
      })
    );
  }, []);

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
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-3 py-2 sm:px-4 sm:py-2.5 shrink-0">
        <h1 className="text-sm font-bold text-gray-900 sm:text-base">시험지 제작기</h1>

        <div className="flex items-center gap-2">
          {/* Mobile/Tablet tab toggle */}
          {hasImages && (
            <div className="flex rounded-lg border border-gray-200 p-0.5 md:hidden">
              <button
                onClick={() => setMobileTab("edit")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  mobileTab === "edit"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500"
                }`}
              >
                <PenLine className="h-3 w-3" />
                편집
              </button>
              <button
                onClick={() => setMobileTab("preview")}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
                  mobileTab === "preview"
                    ? "bg-gray-900 text-white"
                    : "text-gray-500"
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
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40 sm:gap-2 sm:px-4 sm:text-sm"
          >
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin sm:h-4 sm:w-4" />
            ) : (
              <FileDown className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
            <span className="hidden xs:inline">
              {isGenerating ? "생성 중..." : "PDF 다운로드"}
            </span>
            <span className="xs:hidden">PDF</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Editor (hidden on mobile when preview tab active) */}
        <div
          className={`flex w-full flex-col overflow-y-auto bg-white p-3 sm:p-4 md:w-[380px] md:shrink-0 md:border-r md:border-gray-200 lg:w-[420px] ${
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
              />
            )}
          </div>
        </div>

        {/* Right panel - Live preview */}
        <div
          className={`flex-1 overflow-auto bg-gray-100 p-3 sm:p-6 ${
            mobileTab === "preview" && hasImages
              ? "flex"
              : "hidden md:flex"
          }`}
        >
          {hasImages ? (
            <div className="mx-auto flex justify-center pb-6">
              <div
                className="rounded-lg shadow-lg"
                style={{ zoom: "var(--preview-scale, 0.55)" }}
              >
                <ExamPreview
                  headerInfo={headerInfo}
                  images={images}
                  previewRef={livePreviewRef}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 sm:h-16 sm:w-16">
                  <FileDown className="h-6 w-6 text-gray-400 sm:h-7 sm:w-7" />
                </div>
                <p className="text-xs text-gray-400 sm:text-sm">
                  사진을 추가하면
                  <br />
                  미리보기가 표시됩니다
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden preview for PDF capture */}
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
