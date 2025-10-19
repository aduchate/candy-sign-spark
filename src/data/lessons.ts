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

export const lessons: Record<string, LessonData> = {
  "1": {
    title: "Basic Greetings",
    questions: [
      {
        question: "What is the sign for 'Hello'?",
        image: "👋",
        options: ["Wave hand", "Thumbs up", "Clap hands", "Point up"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "How do you sign 'Thank you'?",
        image: "🙏",
        options: ["Wave", "Bow", "Touch chin then forward", "Clap"],
        correct: 2,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "What does this sign mean?",
        image: "👍",
        options: ["Good", "Yes", "Okay", "All of the above"],
        correct: 3,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "2": {
    title: "Family Signs",
    questions: [
      {
        question: "What is the sign for 'Mother'?",
        image: "👩",
        options: ["Point to head", "Touch chin", "Wave hand", "Touch chest"],
        correct: 1,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "How do you sign 'Father'?",
        image: "👨",
        options: ["Touch forehead", "Touch nose", "Wave hand", "Point up"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "What does this sign mean?",
        image: "👶",
        options: ["Child", "Baby", "Small", "Young"],
        correct: 1,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "3": {
    title: "Colors & Numbers",
    questions: [
      {
        question: "What is the sign for 'Red'?",
        image: "🔴",
        options: ["Touch lips", "Point to sky", "Touch nose", "Wave hand"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "How do you sign the number '5'?",
        image: "5️⃣",
        options: ["Open hand", "Closed fist", "Two fingers", "Three fingers"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "What color is this sign for?",
        image: "🟢",
        options: ["Green", "Blue", "Yellow", "Purple"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "4": {
    title: "Daily Activities",
    questions: [
      {
        question: "What is the sign for 'Eat'?",
        image: "🍽️",
        options: ["Hand to mouth", "Rub stomach", "Point to plate", "Open mouth"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "How do you sign 'Sleep'?",
        image: "😴",
        options: ["Hands together near face", "Close eyes", "Lay down motion", "Yawn"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "What does this sign mean?",
        image: "🚶",
        options: ["Walk", "Run", "Jump", "Dance"],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
};
