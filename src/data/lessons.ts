export interface Question {
  question: string;
  image: string;
  options: string[];
  optionVideos: string[];
  correct: number;
  videoUrl: string;
}

export interface LessonData {
  title: string;
  questions: Question[];
}

export const lessons: Record<string, LessonData> = {};
