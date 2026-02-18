"use client";

import { useMemo } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";

interface ExamPreviewProps {
  headerInfo: ExamHeaderInfo;
  images: QuestionImage[];
  previewRef: React.RefObject<HTMLDivElement | null>;
}

const PAGE_W = 210;
const PAGE_H = 297;
const PAD_X = 12;
const PAD_Y = 10;
const HEADER_H = 38;
const COL_GAP = 3;
const ITEM_GAP = 2;
const LABEL_H = 5;

const CONTENT_W = PAGE_W - PAD_X * 2;
const COL_W = (CONTENT_W - COL_GAP) / 2;
const USABLE_H = PAGE_H - PAD_Y * 2;

function imgH(img: QuestionImage): number {
  if (!img.width || !img.height) return 40;
  return (img.height / img.width) * COL_W + LABEL_H + ITEM_GAP;
}

interface PageData {
  left: number[];
  right: number[];
  isFirst: boolean;
}

function paginate(images: QuestionImage[]): PageData[] {
  if (images.length === 0) return [];

  const pages: PageData[] = [];
  let i = 0;
  let isFirst = true;

  while (i < images.length) {
    const maxH = isFirst ? USABLE_H - HEADER_H : USABLE_H;
    const left: number[] = [];
    const right: number[] = [];
    let lH = 0;
    let rH = 0;

    // Fill left column first (top to bottom)
    while (i < images.length) {
      const h = imgH(images[i]);
      if (lH + h > maxH && left.length > 0) break;
      left.push(i);
      lH += h;
      i++;
    }

    // Then fill right column (top to bottom)
    while (i < images.length) {
      const h = imgH(images[i]);
      if (rH + h > maxH && right.length > 0) break;
      right.push(i);
      rH += h;
      i++;
    }

    pages.push({ left, right, isFirst });
    isFirst = false;
  }

  return pages;
}

export default function ExamPreview({
  headerInfo,
  images,
  previewRef,
}: ExamPreviewProps) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.order - b.order),
    [images]
  );
  const pages = useMemo(() => paginate(sorted), [sorted]);

  const today = new Date().toISOString().split("T")[0];
  const h = {
    schoolName: headerInfo.schoolName || "OO고등학교",
    examTitle: headerInfo.examTitle || "1학기 중간고사",
    subject: headerInfo.subject || "과목명",
    grade: headerInfo.grade || "학년",
    date: headerInfo.date || today,
    timeLimit: headerInfo.timeLimit || "50분",
    teacherName: headerInfo.teacherName || "홍길동",
    totalQuestions: headerInfo.totalQuestions || sorted.length,
  };

  const blank = (w: string) => (
    <span
      style={{
        display: "inline-block",
        width: w,
        borderBottom: "1px solid #222",
        minHeight: "1em",
      }}
    />
  );

  const renderHeader = () => (
    <div data-header>
      <div className="mb-1 text-center">
        <h1 className="text-xl font-bold leading-tight">{h.schoolName}</h1>
        <h2 className="text-sm font-semibold mb-1">{h.examTitle}</h2>
      </div>
      <div className="mb-2 flex items-center justify-end gap-4 text-xs">
        <span>
          {h.grade} &nbsp;이름: {blank("60px")}
        </span>
        <span>번호: {blank("30px")}</span>
      </div>
      <table className="mx-auto w-full border-collapse border border-gray-800 text-xs mb-2">
        <tbody>
          <tr>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>과 목</td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>{h.subject}</td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>일 시</td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "20%" }}>{h.date}</td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50" style={{ width: "13%" }}>시 간</td>
            <td className="border border-gray-800 px-2 py-1" style={{ width: "21%" }}>{h.timeLimit}</td>
          </tr>
          <tr>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">출제교사</td>
            <td className="border border-gray-800 px-2 py-1">{h.teacherName}</td>
            <td className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50">총문항</td>
            <td className="border border-gray-800 px-2 py-1" colSpan={3}>{h.totalQuestions}문항</td>
          </tr>
        </tbody>
      </table>
      <hr className="border-t-2 border-gray-800 mb-2" />
    </div>
  );

  const renderItem = (idx: number) => (
    <div key={idx} style={{ marginBottom: `${ITEM_GAP}mm` }}>
      <p className="text-sm font-bold mb-0.5">{idx + 1}.</p>
      <img
        src={sorted[idx].preview}
        alt={`${idx + 1}번`}
        className="w-full h-auto"
        crossOrigin="anonymous"
      />
    </div>
  );

  return (
    <div ref={previewRef} className="flex flex-col gap-6">
      {pages.map((page, pi) => (
        <div
          key={pi}
          data-page={pi}
          className="bg-white shadow-lg relative"
          style={{
            width: `${PAGE_W}mm`,
            height: `${PAGE_H}mm`,
            padding: `${PAD_Y}mm ${PAD_X}mm`,
            overflow: "hidden",
          }}
        >
          {page.isFirst && renderHeader()}

          <div
            style={{
              display: "flex",
              gap: `${COL_GAP}mm`,
              alignItems: "flex-start",
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              {page.left.map(renderItem)}
            </div>
            <div
              style={{
                width: "0.5px",
                alignSelf: "stretch",
                backgroundColor: "#d1d5db",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {page.right.map(renderItem)}
            </div>
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-400"
            style={{ paddingBottom: "5mm" }}
          >
            {pi + 1} / {pages.length}
          </div>
        </div>
      ))}
    </div>
  );
}
