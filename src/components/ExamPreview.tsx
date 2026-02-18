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
        padding: "12mm 12mm",
      }}
    >
      {/* Header - compact */}
      <div className="mb-2 text-center">
        <h1 className="text-xl font-bold leading-tight">{headerInfo.schoolName}</h1>
        <h2 className="text-sm font-semibold mb-1">{headerInfo.examTitle}</h2>

        <table className="mx-auto w-full border-collapse border border-gray-800 text-xs">
          <tbody>
            <tr>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
                과 목
              </td>
              <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>
                {headerInfo.subject}
              </td>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
                학년/반
              </td>
              <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>
                {headerInfo.grade}
              </td>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
                시 간
              </td>
              <td className="border border-gray-800 px-2 py-1" style={{ width: "21%" }}>
                {headerInfo.timeLimit}
              </td>
            </tr>
            <tr>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">
                일 시
              </td>
              <td className="border border-gray-800 px-2 py-1">
                {headerInfo.date}
              </td>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">
                출제교사
              </td>
              <td className="border border-gray-800 px-2 py-1">
                {headerInfo.teacherName}
              </td>
              <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">
                총문항
              </td>
              <td className="border border-gray-800 px-2 py-1">
                {headerInfo.totalQuestions}문항
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Divider */}
      <hr className="border-t-2 border-gray-800 mb-3" />

      {/* Questions - 2 columns */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px",
        }}
      >
        {sortedImages.map((image, index) => (
          <div key={image.id}>
            <p className="text-sm font-bold mb-1">{index + 1}.</p>
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
