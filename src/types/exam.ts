export interface ExamHeaderInfo {
  schoolName: string;
  examTitle: string;
  subject: string;
  grade: string;
  date: string;
  timeLimit: string;
  teacherName: string;
  totalQuestions: number;
}

export interface QuestionImage {
  id: string;
  file: File;
  preview: string;
  order: number;
}
