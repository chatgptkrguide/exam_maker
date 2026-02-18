"use client";

import { ExamHeaderInfo } from "@/types/exam";

interface ExamHeaderProps {
  headerInfo: ExamHeaderInfo;
  onChange: (info: ExamHeaderInfo) => void;
}

export default function ExamHeader({ headerInfo, onChange }: ExamHeaderProps) {
  const handleChange = (field: keyof ExamHeaderInfo, value: string | number) => {
    onChange({ ...headerInfo, [field]: value });
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-gray-900">시험 정보</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            학교 이름
          </label>
          <input
            type="text"
            value={headerInfo.schoolName}
            onChange={(e) => handleChange("schoolName", e.target.value)}
            placeholder="예: OO고등학교"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            시험명
          </label>
          <input
            type="text"
            value={headerInfo.examTitle}
            onChange={(e) => handleChange("examTitle", e.target.value)}
            placeholder="예: 1학기 중간고사"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            과목명
          </label>
          <input
            type="text"
            value={headerInfo.subject}
            onChange={(e) => handleChange("subject", e.target.value)}
            placeholder="예: 수학 I"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            학년 / 반
          </label>
          <input
            type="text"
            value={headerInfo.grade}
            onChange={(e) => handleChange("grade", e.target.value)}
            placeholder="예: 2학년 3반"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            시험 날짜
          </label>
          <input
            type="date"
            value={headerInfo.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            시험 시간
          </label>
          <input
            type="text"
            value={headerInfo.timeLimit}
            onChange={(e) => handleChange("timeLimit", e.target.value)}
            placeholder="예: 50분"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            출제 교사
          </label>
          <input
            type="text"
            value={headerInfo.teacherName}
            onChange={(e) => handleChange("teacherName", e.target.value)}
            placeholder="예: 홍길동"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            총 문항 수
          </label>
          <input
            type="number"
            min={1}
            value={headerInfo.totalQuestions}
            onChange={(e) =>
              handleChange("totalQuestions", parseInt(e.target.value) || 0)
            }
            placeholder="예: 25"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
