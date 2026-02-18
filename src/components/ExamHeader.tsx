"use client";

import { ExamHeaderInfo } from "@/types/exam";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

interface ExamHeaderProps {
  headerInfo: ExamHeaderInfo;
  onChange: (info: ExamHeaderInfo) => void;
}

const fields: {
  key: keyof ExamHeaderInfo;
  label: string;
  placeholder: string;
  type?: string;
}[] = [
  { key: "schoolName", label: "학교", placeholder: "OO고등학교" },
  { key: "examTitle", label: "시험명", placeholder: "1학기 중간고사" },
  { key: "subject", label: "과목", placeholder: "수학 I" },
  { key: "grade", label: "학년/반", placeholder: "2학년 3반" },
  { key: "date", label: "날짜", placeholder: "", type: "date" },
  { key: "timeLimit", label: "시간", placeholder: "50분" },
  { key: "teacherName", label: "출제교사", placeholder: "홍길동" },
];

export default function ExamHeader({ headerInfo, onChange }: ExamHeaderProps) {
  const [open, setOpen] = useState(false);

  const handleChange = (
    field: keyof ExamHeaderInfo,
    value: string | number
  ) => {
    onChange({ ...headerInfo, [field]: value });
  };

  const filledCount = fields.filter(
    (f) => headerInfo[f.key] !== "" && headerInfo[f.key] !== 0
  ).length;

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold text-gray-900 sm:text-sm whitespace-nowrap">
            시험 정보
          </span>
          {!open && (
            <span className="truncate text-[10px] text-gray-400 sm:text-xs">
              {filledCount > 0
                ? `${filledCount}개 입력됨`
                : "미입력 시 기본값 적용"}
            </span>
          )}
        </div>
        {open ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
        )}
      </button>

      {open && (
        <div className="border-t border-gray-100 px-3 pb-3 pt-2">
          <div className="grid grid-cols-2 gap-2 xs:gap-2.5">
            {fields.map((f) => (
              <div key={f.key} className={f.key === "teacherName" ? "col-span-2 xs:col-span-1" : ""}>
                <label className="mb-0.5 block text-[10px] font-medium text-gray-500 sm:text-xs">
                  {f.label}
                </label>
                <input
                  type={f.type || "text"}
                  value={headerInfo[f.key]}
                  onChange={(e) => handleChange(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-gray-200 px-2 py-1.5 text-xs placeholder-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none sm:text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
