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

export const lessons: Record<string, LessonData> = {
  "1": {
    title: "Salutations de base",
    questions: [
      {
        question: "Quel est le signe pour 'Bonjour' ?",
        image: "👋",
        options: ["Agiter la main", "Pouce levé", "Applaudir", "Pointer vers le haut"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-young-man-clapping-his-hands-9640/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Comment signer 'Merci' ?",
        image: "🙏",
        options: ["Agiter", "S'incliner", "Toucher le menton puis l'avant", "Applaudir"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-bowing-down-8472/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-young-man-clapping-his-hands-9640/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 2,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Que signifie ce signe ?",
        image: "👍",
        options: ["Bien", "Oui", "D'accord", "Toutes ces réponses"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
        ],
        correct: 3,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "2": {
    title: "Signes de la famille",
    questions: [
      {
        question: "Quel est le signe pour 'Mère' ?",
        image: "👩",
        options: ["Pointer la tête", "Toucher le menton", "Agiter la main", "Toucher la poitrine"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
        ],
        correct: 1,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Comment signer 'Père' ?",
        image: "👨",
        options: ["Toucher le front", "Toucher le nez", "Agiter la main", "Pointer vers le haut"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Que signifie ce signe ?",
        image: "👶",
        options: ["Enfant", "Bébé", "Petit", "Jeune"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 1,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "3": {
    title: "Couleurs et nombres",
    questions: [
      {
        question: "Quel est le signe pour 'Rouge' ?",
        image: "🔴",
        options: ["Toucher les lèvres", "Pointer le ciel", "Toucher le nez", "Agiter la main"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Comment signer le nombre '5' ?",
        image: "5️⃣",
        options: ["Main ouverte", "Poing fermé", "Deux doigts", "Trois doigts"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "De quelle couleur est ce signe ?",
        image: "🟢",
        options: ["Vert", "Bleu", "Jaune", "Violet"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
  "4": {
    title: "Activités quotidiennes",
    questions: [
      {
        question: "Quel est le signe pour 'Manger' ?",
        image: "🍽️",
        options: ["Main à la bouche", "Frotter l'estomac", "Pointer l'assiette", "Ouvrir la bouche"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Comment signer 'Dormir' ?",
        image: "😴",
        options: ["Mains jointes près du visage", "Fermer les yeux", "Mouvement de s'allonger", "Bâiller"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
      {
        question: "Que signifie ce signe ?",
        image: "🚶",
        options: ["Marcher", "Courir", "Sauter", "Danser"],
        optionVideos: [
          "https://storage.coverr.co/videos/coverr-woman-waving-her-hand-7933/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
          "https://storage.coverr.co/videos/coverr-man-pointing-up-with-his-finger-4273/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjg2OTY1ODQzfQ.d8R5EGtEfwE2JxXSEoLPJaTYJqhN4LJkRwGhCBnRqOQ",
          "https://storage.coverr.co/videos/coverr-woman-with-her-hands-on-her-chest-in-gratitude-3616/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY"
        ],
        correct: 0,
        videoUrl: "https://storage.coverr.co/videos/coverr-person-showing-thumbs-up-3847/preview?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcHBJZCI6Ijg3NjdFMzIzRjlGQzEzN0E4QTAyIiwiaWF0IjoxNjMxNjI5MjUyfQ.P8VLfCH9pZ3bg0hTJRvZ9c0LN6H8RM_OYGp0ByOmNqY",
      },
    ],
  },
};
