"use client";

import { useMemo } from "react";
import { ExamHeaderInfo, QuestionImage } from "@/types/exam";

interface ExamPreviewProps {
  headerInfo: ExamHeaderInfo;
  images: QuestionImage[];
  previewRef: React.RefObject<HTMLDivElement | null>;
}

// All units in mm
const PAGE_W = 210;
const PAGE_H = 297;
const PAD_X = 12;
const PAD_Y = 10;
const HEADER_H = 38; // header + table + divider
const COL_GAP = 3;
const ROW_GAP = 3;
const LABEL_H = 5; // "1." label height

const CONTENT_W = PAGE_W - PAD_X * 2;
const COL_W = (CONTENT_W - COL_GAP) / 2;
const USABLE_H = PAGE_H - PAD_Y * 2;

function imgHeightMm(img: QuestionImage): number {
  if (!img.width || !img.height) return 40;
  return (img.height / img.width) * COL_W + LABEL_H + ROW_GAP;
}

interface PageData {
  rows: { left: number; right: number | null }[];
  isFirst: boolean;
  startNum: number;
}

function paginate(images: QuestionImage[]): PageData[] {
  if (images.length === 0) return [];

  // Build rows (pairs)
  const rows: { left: number; right: number | null }[] = [];
  for (let i = 0; i < images.length; i += 2) {
    rows.push({
      left: i,
      right: i + 1 < images.length ? i + 1 : null,
    });
  }

  // Calculate row heights
  const rowHeights = rows.map((row) => {
    const lh = imgHeightMm(images[row.left]);
    const rh = row.right !== null ? imgHeightMm(images[row.right]) : 0;
    return Math.max(lh, rh);
  });

  const pages: PageData[] = [];
  let available = USABLE_H - HEADER_H; // first page has header
  let currentRows: typeof rows = [];
  let startNum = 0;
  let isFirst = true;

  rowHeights.forEach((rh, i) => {
    if (rh > available && currentRows.length > 0) {
      pages.push({ rows: currentRows, isFirst, startNum });
      startNum += currentRows.reduce(
        (s, r) => s + 1 + (r.right !== null ? 1 : 0),
        0
      );
      currentRows = [];
      available = USABLE_H;
      isFirst = false;
    }
    currentRows.push(rows[i]);
    available -= rh;
  });

  if (currentRows.length > 0) {
    pages.push({ rows: currentRows, isFirst, startNum });
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
            <td
              className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50"
              style={{ width: "13%" }}
            >
              과 목
            </td>
            <td
              className="border border-gray-800 px-2 py-1"
              style={{ width: "20%" }}
            >
              {h.subject}
            </td>
            <td
              className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50"
              style={{ width: "13%" }}
            >
              일 시
            </td>
            <td
              className="border border-gray-800 px-2 py-1"
              style={{ width: "20%" }}
            >
              {h.date}
            </td>
            <td
              className="border border-gray-800 px-2 py-1 font-semibold bg-gray-50"
              style={{ width: "13%" }}
            >
              시 간
            </td>
            <td
              className="border border-gray-800 px-2 py-1"
              style={{ width: "21%" }}
            >
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
      <hr className="border-t-2 border-gray-800 mb-3" />
    </div>
  );

  return (
    <div ref={previewRef} className="flex flex-col gap-6">
      {pages.map((page, pi) => {
        let qNum = page.startNum;
        return (
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

            {page.rows.map((row, ri) => {
              const leftNum = ++qNum;
              const rightNum = row.right !== null ? ++qNum : null;
              return (
                <div
                  key={ri}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: `${COL_GAP}mm`,
                    marginBottom: `${ROW_GAP}mm`,
                  }}
                >
                  <div>
                    <p className="text-sm font-bold mb-0.5">{leftNum}.</p>
                    <img
                      src={sorted[row.left].preview}
                      alt={`${leftNum}번`}
                      className="w-full h-auto"
                      crossOrigin="anonymous"
                    />
                  </div>
                  {row.right !== null ? (
                    <div>
                      <p className="text-sm font-bold mb-0.5">{rightNum}.</p>
                      <img
                        src={sorted[row.right].preview}
                        alt={`${rightNum}번`}
                        className="w-full h-auto"
                        crossOrigin="anonymous"
                      />
                    </div>
                  ) : (
                    <div />
                  )}
                </div>
              );
            })}

            {/* Page number */}
            <div
              className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-gray-400"
              style={{ paddingBottom: "5mm" }}
            >
              {pi + 1} / {pages.length}
            </div>
          </div>
        );
      })}
    </div>
  );
}
