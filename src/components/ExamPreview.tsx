"use client";

import { ExamHeaderInfo, QuestionImage } from "@/types/exam";

interface ExamPreviewProps {
  headerInfo: ExamHeaderInfo;
  images: QuestionImage[];
  previewRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExamPreview({
  headerInfo,
  images,
  previewRef,
}: ExamPreviewProps) {
  const sortedImages = [...images].sort((a, b) => a.order - b.order);

  return (
    <div
      ref={previewRef}
      className="mx-auto bg-white shadow-lg"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "20mm 15mm",
      }}
    >
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-1">{headerInfo.schoolName}</h1>
        <h2 className="text-lg font-semibold mb-4">{headerInfo.examTitle}</h2>

        <table className="mx-auto w-full max-w-[500px] border-collapse border border-gray-800 text-sm">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50 w-1/6">
                과 목
              </td>
              <td className="border border-gray-800 px-4 py-2 w-2/6">
                {headerInfo.subject}
              </td>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50 w-1/6">
                학년/반
              </td>
              <td className="border border-gray-800 px-4 py-2 w-2/6">
                {headerInfo.grade}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50">
                일 시
              </td>
              <td className="border border-gray-800 px-4 py-2">
                {headerInfo.date}
              </td>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50">
                시 간
              </td>
              <td className="border border-gray-800 px-4 py-2">
                {headerInfo.timeLimit}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50">
                출제교사
              </td>
              <td className="border border-gray-800 px-4 py-2">
                {headerInfo.teacherName}
              </td>
              <td className="border border-gray-800 px-4 py-2 font-semibold bg-gray-50">
                총문항
              </td>
              <td className="border border-gray-800 px-4 py-2">
                {headerInfo.totalQuestions}문항
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-gray-800 mb-6" />

      {/* Questions */}
      <div className="space-y-6">
        {sortedImages.map((image, index) => (
          <div key={image.id}>
            <p className="text-base font-bold mb-2">{index + 1}.</p>
            <img
              src={image.preview}
              alt={`${index + 1}번 문항`}
              className="w-full h-auto"
              crossOrigin="anonymous"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
