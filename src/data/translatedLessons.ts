import i18n from '@/i18n/config';

export interface Question {
  question: string;
  image: string;
  options: string[];
  correct: number;
  videoUrl: string;
}

export interface LessonData {
  title: string;
  questions: Question[];
}

const lessonKeys = ['basicGreetings', 'familySigns', 'colorsNumbers', 'dailyActivities'] as const;

export const getTranslatedLessons = (): Record<string, LessonData> => {
  const videoUrls = [
    "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
    "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
    "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
  ];

  const images = {
    basicGreetings: ["👋", "🙏", "👍"],
    familySigns: ["👩", "👨", "👶"],
    colorsNumbers: ["🔴", "5️⃣", "🟢"],
    dailyActivities: ["🍽️", "😴", "🚶"]
  };

  const lessons: Record<string, LessonData> = {};

  lessonKeys.forEach((key, lessonIndex) => {
    lessons[String(lessonIndex + 1)] = {
      title: i18n.t(`lessons.${key}.title`),
      questions: [1, 2, 3].map((qNum) => ({
        question: i18n.t(`lessons.${key}.q${qNum}.question`),
        image: images[key][qNum - 1],
        options: i18n.t(`lessons.${key}.q${qNum}.options`, { returnObjects: true }) as string[],
        correct: lessonIndex === 0 && qNum === 1 ? 0 :
                 lessonIndex === 0 && qNum === 2 ? 2 :
                 lessonIndex === 0 && qNum === 3 ? 3 :
                 lessonIndex === 1 && qNum === 1 ? 1 :
                 lessonIndex === 1 && qNum === 2 ? 0 :
                 lessonIndex === 1 && qNum === 3 ? 1 :
                 lessonIndex === 2 && qNum === 1 ? 0 :
                 lessonIndex === 2 && qNum === 2 ? 0 :
                 lessonIndex === 2 && qNum === 3 ? 0 :
                 0,
        videoUrl: videoUrls[qNum - 1]
      }))
    };
  });

  return lessons;
};
