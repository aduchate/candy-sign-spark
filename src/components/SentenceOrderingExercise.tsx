import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WordCard } from "@/components/WordCard";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WordCardData {
  word: string;
  order: number;
  videoUrl?: string;
}

interface SentenceOrderingExerciseProps {
  exerciseId: string;
  words: WordCardData[];
  correctOrder: number[];
  fullSentenceVideo?: string;
  onComplete: (correct: boolean, timeSpent: number) => void;
}

export const SentenceOrderingExercise = ({
  words,
  correctOrder,
  fullSentenceVideo,
  onComplete,
}: SentenceOrderingExerciseProps) => {
  const [shuffledWords, setShuffledWords] = useState<WordCardData[]>([]);
  const [userOrder, setUserOrder] = useState<number[]>([]);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [startTime] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      const wordsWithVideos = await Promise.all(
        words.map(async (word) => {
          if (word.videoUrl) return word;

          // Try to get video from word_signs
          const { data } = await supabase
            .from("word_signs")
            .select("video_url")
            .eq("word", word.word.toLowerCase())
            .maybeSingle();

          if (data?.video_url) {
            return { ...word, videoUrl: data.video_url };
          }

          // Fetch and store if not found
          try {
            const { data: fetchData } = await supabase.functions.invoke(
              "fetch-and-store-lsfb-video",
              {
                body: { word: word.word, type: "word" },
              }
            );

            if (fetchData?.videoUrl) {
              return { ...word, videoUrl: fetchData.videoUrl };
            }
          } catch (error) {
            console.error(`Error fetching video for ${word.word}:`, error);
          }

          return word;
        })
      );

      // Shuffle words
      const shuffled = [...wordsWithVideos].sort(() => Math.random() - 0.5);
      setShuffledWords(shuffled);
      setUserOrder(shuffled.map((_, i) => i));
      setLoading(false);
    };

    loadVideos();
  }, [words]);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newOrder = [...userOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);

    setUserOrder(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const checkAnswer = () => {
    const userSequence = userOrder.map((i) => shuffledWords[i].order);
    const correct = JSON.stringify(userSequence) === JSON.stringify(correctOrder);

    setIsCorrect(correct);
    setShowFeedback(true);

    const timeSpent = Math.floor((Date.now() - startTime) / 1000);

    if (correct) {
      toast.success("Bravo ! La phrase est correcte !");
    } else {
      toast.error("Pas tout à fait... Réessayez !");
    }

    setTimeout(() => {
      onComplete(correct, timeSpent);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des vidéos...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {fullSentenceVideo && (
        <div className="flex justify-center mb-6">
          <video
            src={fullSentenceVideo}
            className="w-full max-w-md rounded-lg shadow-lg"
            controls
            playsInline
          />
        </div>
      )}

      <div className="space-y-3">
        <p className="text-center font-medium mb-4">
          Remettez les mots dans le bon ordre :
        </p>
        {userOrder.map((wordIndex, displayIndex) => (
          <div
            key={displayIndex}
            draggable
            onDragStart={() => handleDragStart(displayIndex)}
            onDragOver={(e) => handleDragOver(e, displayIndex)}
            onDragEnd={handleDragEnd}
          >
            <WordCard
              word={shuffledWords[wordIndex].word}
              videoUrl={shuffledWords[wordIndex].videoUrl}
              isDragging={draggedIndex === displayIndex}
              isCorrect={
                showFeedback
                  ? shuffledWords[wordIndex].order === correctOrder[displayIndex]
                  : undefined
              }
              showFeedback={showFeedback}
            />
          </div>
        ))}
      </div>

      {!showFeedback && (
        <Button onClick={checkAnswer} className="w-full" size="lg">
          Valider
        </Button>
      )}
    </div>
  );
};
