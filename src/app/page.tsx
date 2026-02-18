"use client";

import { useState, useRef, useCallback } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";
import ExamHeader from "@/components/ExamHeader";
import ImageUploader from "@/components/ImageUploader";
import ImageList from "@/components/ImageList";
import ExamPreview from "@/components/ExamPreview";
import { generatePdf } from "@/lib/pdf";
import { FileDown, Loader2 } from "lucide-react";

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
  const pdfRef = useRef<HTMLDivElement | null>(null);
  const livePreviewRef = useRef<HTMLDivElement | null>(null);

  const handleImagesAdd = useCallback((files: File[]) => {
    const newImages: QuestionImage[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 9)}`,
      file,
      preview: URL.createObjectURL(file),
      order: 0,
    }));

    setImages((prev) => {
      const updated = [...prev, ...newImages].map((img, i) => ({
        ...img,
        order: i,
      }));
      return updated;
    });
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
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2.5 shrink-0">
        <h1 className="text-base font-bold text-gray-900">시험지 제작기</h1>
        <button
          onClick={handleDownloadPdf}
          disabled={!hasImages || isGenerating}
          className="hidden sm:flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileDown className="h-4 w-4" />
          )}
          {isGenerating ? "생성 중..." : "PDF 다운로드"}
        </button>
      </header>

      {/* Main split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Editor */}
        <div className="flex w-full flex-col overflow-y-auto border-r border-gray-200 bg-white p-4 lg:w-[420px] lg:shrink-0">
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
              />
            )}
          </div>
        </div>

        {/* Right panel - Live preview */}
        <div className="hidden flex-1 overflow-auto bg-gray-100 p-6 lg:block">
          {hasImages ? (
            <div className="mx-auto" style={{ width: "fit-content" }}>
              <div
                className="overflow-hidden rounded-lg shadow-lg"
                style={{ transform: "scale(0.55)", transformOrigin: "top center" }}
              >
                <ExamPreview
                  headerInfo={headerInfo}
                  images={images}
                  previewRef={livePreviewRef}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                  <FileDown className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm text-gray-400">
                  왼쪽에서 사진을 추가하면
                  <br />
                  시험지 미리보기가 표시됩니다
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

      {/* Mobile bottom bar */}
      {hasImages && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:hidden shrink-0">
          <span className="text-sm text-gray-500">{images.length}문항</span>
          <button
            onClick={handleDownloadPdf}
            disabled={isGenerating}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-40"
          >
            {isGenerating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="h-4 w-4" />
            )}
            {isGenerating ? "생성 중..." : "PDF 다운로드"}
          </button>
        </div>
      )}
    </div>
  );
}
