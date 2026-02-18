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

  const today = new Date().toISOString().split("T")[0];
  const h = {
    schoolName: headerInfo.schoolName || "OO고등학교",
    examTitle: headerInfo.examTitle || "1학기 중간고사",
    subject: headerInfo.subject || "과목명",
    grade: headerInfo.grade || "학년",
    date: headerInfo.date || today,
    timeLimit: headerInfo.timeLimit || "50분",
    teacherName: headerInfo.teacherName || "홍길동",
    totalQuestions: headerInfo.totalQuestions || sortedImages.length,
  };

  const blank = (width: string) => (
    <span
      style={{
        display: "inline-block",
        width,
        borderBottom: "1px solid #222",
        minHeight: "1em",
      }}
    />
  );

  return (
    <div
      ref={previewRef}
      className="mx-auto bg-white shadow-lg"
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "10mm 12mm",
      }}
    >
      {/* Header */}
      <div className="mb-1 text-center">
        <h1 className="text-xl font-bold leading-tight">{h.schoolName}</h1>
        <h2 className="text-sm font-semibold mb-1">{h.examTitle}</h2>
      </div>

      {/* Student info - fill-in blanks */}
      <div className="mb-2 flex items-center justify-end gap-4 text-xs">
        <span>{h.grade} &nbsp;이름: {blank("60px")}</span>
        <span>번호: {blank("30px")}</span>
      </div>

      {/* Info table */}
      <table className="mx-auto w-full border-collapse border border-gray-800 text-xs mb-2">
        <tbody>
          <tr>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
              과 목
            </td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>
              {h.subject}
            </td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
              일 시
            </td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>
              {h.date}
            </td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>
              시 간
            </td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "21%" }}>
              {h.timeLimit}
            </td>
          </tr>
          <tr>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">
              출제교사
            </td>
            <td className="border border-gray-800 px-2 py-1">
              {h.teacherName}
            </td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">
              총문항
            </td>
            <td className="border border-gray-800 px-2 py-1" colSpan={3}>
              {h.totalQuestions}문항
            </td>
          </tr>
        </tbody>
      </table>

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
