"use client";

import { useState, useRef, useCallback } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";
import ExamHeader from "@/components/ExamHeader";
import ImageUploader from "@/components/ImageUploader";
import ImageList from "@/components/ImageList";
import ExamPreview from "@/components/ExamPreview";
import { generatePdf } from "@/lib/pdf";
import { FileDown, Eye, EyeOff } from "lucide-react";

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
  const [showPreview, setShowPreview] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement | null>(null);

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

  const handleReorder = useCallback((reordered: QuestionImage[]) => {
    setImages(reordered);
  }, []);

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    setIsGenerating(true);
    try {
      const filename = headerInfo.subject
        ? `${headerInfo.schoolName}_${headerInfo.subject}_시험지.pdf`
        : "시험지.pdf";
      await generatePdf(previewRef.current, filename);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            시험지 제작기
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              {showPreview ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
              {showPreview ? "편집으로 돌아가기" : "미리보기"}
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={images.length === 0 || isGenerating}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FileDown className="h-4 w-4" />
              {isGenerating ? "생성 중..." : "PDF 다운로드"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-6">
        {!showPreview ? (
          <div className="space-y-6">
            <ExamHeader headerInfo={headerInfo} onChange={setHeaderInfo} />
            <ImageUploader onImagesAdd={handleImagesAdd} />
            <ImageList
              images={images}
              onRemove={handleRemove}
              onReorder={handleReorder}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <p className="mb-4 text-sm text-gray-500">
              아래는 시험지 미리보기입니다. PDF 다운로드 버튼을 눌러 저장하세요.
            </p>
            <div className="overflow-auto rounded-lg border border-gray-200 shadow-lg">
              <ExamPreview
                headerInfo={headerInfo}
                images={images}
                previewRef={previewRef}
              />
            </div>
          </div>
        )}
      </main>

      {/* Hidden preview for PDF generation (always rendered) */}
      {!showPreview && (
        <div className="fixed left-[-9999px] top-0">
          <ExamPreview
            headerInfo={headerInfo}
            images={images}
            previewRef={previewRef}
          />
        </div>
      )}
    </div>
  );
}
