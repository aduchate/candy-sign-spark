import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface QuizItem {
  question: string;
  questionLabel: string;
  correctAnswer: string;
  options: string[];
}

interface QuizExerciseProps {
  items: QuizItem[];
  title: string;
  isChildMode?: boolean;
}

export const QuizExercise = ({ items, title, isChildMode = false }: QuizExerciseProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"fireworks" | "balloons" | "petals">("fireworks");

  const currentItem = items[currentIndex];
  const isCorrect = selectedAnswer === currentItem.correctAnswer;

  const handleAnswerSelect = (answer: string) => {
    if (showResult) return;
    setSelectedAnswer(answer);
    setShowResult(true);

    if (answer === currentItem.correctAnswer) {
      setScore((prev) => prev + 1);
      if (isChildMode) {
        // Random celebration type
        const types: Array<"fireworks" | "balloons" | "petals"> = ["fireworks", "balloons", "petals"];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setCelebrationType(randomType);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        
        toast.success("Bravo ! 🎉", {
          description: "Tu as trouvé la bonne réponse !",
        });
      } else {
        toast.success("Correct !", {
          description: "Bonne réponse !",
        });
      }
    } else {
      if (isChildMode) {
        toast.error("Oups ! 😅", {
          description: "Essaie encore une fois !",
        });
      } else {
        toast.error("Incorrect", {
          description: "Ce n'est pas la bonne réponse.",
        });
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < items.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setQuizCompleted(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (quizCompleted) {
    const percentage = Math.round((score / items.length) * 100);
    return (
      <div className="space-y-6">
        {isChildMode && percentage >= 50 && <ConfettiCelebration show={true} type="fireworks" />}
        <Card className={`p-12 text-center ${isChildMode ? "border-4 border-primary shadow-candy" : ""}`}>
          <div className={`text-6xl mb-4 ${isChildMode ? "animate-bounce" : ""}`}>
            {percentage >= 80 ? "🎉" : percentage >= 50 ? "👍" : "💪"}
          </div>
          <h3 className={`text-3xl font-bold mb-4 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
            {isChildMode ? "Quiz terminé !" : "Quiz terminé"}
          </h3>
          <p className="text-2xl mb-2">
            Score: {score} / {items.length}
          </p>
          <p className="text-xl text-muted-foreground mb-6">
            {percentage}% de réussite
          </p>
          <Button
            onClick={handleRestart}
            size="lg"
            className={isChildMode ? "gradient-candy" : ""}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {isChildMode ? "Recommencer" : "Recommencer le quiz"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isChildMode && showCelebration && <ConfettiCelebration show={showCelebration} type={celebrationType} />}
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
          {title}
        </h3>
        <p className="text-muted-foreground">
          {isChildMode ? "Trouve le bon signe ! 🎯" : "Sélectionnez le signe correspondant"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Question {currentIndex + 1} / {items.length} • Score: {score}
        </p>
      </div>

      <Card className={`p-8 ${isChildMode ? "border-4 border-primary/50 shadow-candy" : ""}`}>
        <div className="text-center mb-8">
          <div className={`${isChildMode ? "text-7xl" : "text-6xl"} font-bold mb-3 ${isChildMode ? "animate-pulse" : ""}`}>
            {currentItem.question}
          </div>
          <p className={`${isChildMode ? "text-xl" : "text-lg"} text-muted-foreground`}>
            {currentItem.questionLabel}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {currentItem.options.map((option, index) => (
            <Card
              key={index}
              className={`relative p-4 cursor-pointer transition-all duration-300 hover:scale-105 aspect-video ${
                showResult
                  ? option === currentItem.correctAnswer
                    ? "ring-4 ring-green-500 bg-green-50 dark:bg-green-950"
                    : option === selectedAnswer
                    ? "ring-4 ring-red-500 bg-red-50 dark:bg-red-950"
                    : "opacity-50"
                  : selectedAnswer === option
                  ? "ring-4 ring-primary"
                  : isChildMode
                  ? "border-2 border-primary/30 hover:border-primary"
                  : ""
              }`}
              onClick={() => handleAnswerSelect(option)}
            >
              {option && (
                <video
                  src={option}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain rounded"
                />
              )}
              {showResult && option === currentItem.correctAnswer && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {showResult && option === selectedAnswer && option !== currentItem.correctAnswer && (
                <div className="absolute top-2 right-2">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </Card>
          ))}
        </div>

        {showResult && (
          <div className="text-center">
            <Button
              onClick={handleNext}
              size="lg"
              className={isChildMode ? "gradient-accent" : ""}
            >
              {currentIndex < items.length - 1
                ? isChildMode
                  ? "Question suivante 🚀"
                  : "Question suivante"
                : isChildMode
                ? "Voir mon score ! 🏆"
                : "Voir les résultats"}
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};