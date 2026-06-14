import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, XCircle, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { offlineCache } from "@/lib/offlineCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

// Question normalisée, prête à être affichée quel que soit l'exercice source.
type CultureQuestion =
  | { type: "true_false"; question: string; correctAnswer: boolean }
  | { type: "multiple_choice"; question: string; options: string[]; correctAnswer: number };

const CACHE_KEY = "culture_quiz_questions";

// Aplatit les leçons « Culture » et leurs exercices en une liste de questions.
// Un exercice peut contenir plusieurs questions (cf. ExerciseFormDialog), on les
// déplie donc toutes — contrairement à la page Leçon qui n'affiche que la première.
const flattenCultureQuestions = (lessons: any[]): CultureQuestion[] => {
  const questions: CultureQuestion[] = [];

  for (const lesson of lessons ?? []) {
    const exercises = [...(lesson.exercises ?? [])].sort((a: any, b: any) => {
      if (a.order_index !== b.order_index) return a.order_index - b.order_index;
      // order_index est souvent identique (0) ; on stabilise via created_at puis id.
      return (a.created_at ?? "").localeCompare(b.created_at ?? "") || a.id.localeCompare(b.id);
    });

    for (const exercise of exercises) {
      const contentQuestions = exercise.content?.questions ?? [];
      for (const q of contentQuestions) {
        if (exercise.type === "true_false" && typeof q?.correctAnswer === "boolean") {
          questions.push({ type: "true_false", question: q.question, correctAnswer: q.correctAnswer });
        } else if (
          exercise.type === "multiple_choice" &&
          Array.isArray(q?.options) &&
          typeof q?.correctAnswer === "number"
        ) {
          questions.push({
            type: "multiple_choice",
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
          });
        }
      }
    }
  }

  return questions;
};

export const CultureQuiz = () => {
  const isOnline = useOnlineStatus();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<CultureQuestion[]>([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!isOnline) {
        const cached = offlineCache.get<CultureQuestion[]>(CACHE_KEY);
        if (cached && !cancelled) setQuestions(cached);
        if (!cancelled) setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("lessons")
        .select("id, order_index, exercises(id, type, content, order_index, created_at)")
        .eq("category", "Culture")
        .order("order_index");

      if (cancelled) return;

      if (error) {
        console.error("Error loading culture quiz:", error);
        const cached = offlineCache.get<CultureQuestion[]>(CACHE_KEY);
        if (cached) setQuestions(cached);
      } else {
        const flattened = flattenCultureQuestions(data ?? []);
        setQuestions(flattened);
        offlineCache.set(CACHE_KEY, flattened);
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  const handleAnswer = (answerIndex: number, correct: boolean) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    if (correct) {
      setScore((s) => s + 1);
      toast.success("Bonne réponse !");
    } else {
      toast.error("Mauvaise réponse");
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setFinished(false);
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-xl font-bold mb-4">Quiz - Testez vos connaissances</h3>
        <p className="text-muted-foreground text-center py-8">
          Les quiz sur la culture sourde seront bientôt disponibles
        </p>
      </Card>
    );
  }

  if (finished) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-2xl font-bold mb-4">Résultats</h3>
        <div className="text-5xl font-bold mb-4">
          {score} / {questions.length}
        </div>
        <p className="text-muted-foreground mb-6">
          {score === questions.length
            ? "Parfait ! Vous maîtrisez le sujet."
            : score >= questions.length / 2
            ? "Bon travail ! Continuez à apprendre."
            : "Il y a encore des choses à découvrir."}
        </p>
        <Button onClick={resetQuiz} variant="outline">
          <RotateCcw className="w-4 h-4 mr-2" />
          Recommencer le quiz
        </Button>
      </Card>
    );
  }

  const question = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold">Quiz - Testez vos connaissances</h3>
        <span className="text-sm text-muted-foreground">
          {currentIndex + 1}/{questions.length}
        </span>
      </div>
      <Progress value={progress} className="h-2 mb-6" />

      <div className="text-center mb-6">
        <h4 className="text-lg font-semibold">{question.question}</h4>
      </div>

      {question.type === "true_false" && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: "Vrai", symbol: "✓", value: true },
            { label: "Faux", symbol: "✗", value: false },
          ].map(({ label, symbol, value }, index) => {
            const isCorrectOption = question.correctAnswer === value;
            return (
              <button
                key={label}
                onClick={() => handleAnswer(index, value === question.correctAnswer)}
                disabled={showResult}
                className={`relative overflow-hidden rounded-lg border-4 transition-all hover:scale-105 ${
                  showResult
                    ? isCorrectOption
                      ? "border-success shadow-glow"
                      : selectedAnswer === index
                      ? "border-destructive"
                      : "border-muted opacity-50"
                    : "border-primary/20 hover:border-primary"
                }`}
              >
                <div className="p-8 text-center">
                  <p className="text-3xl font-bold mb-2">{symbol}</p>
                  <p className="text-xl font-semibold">{label}</p>
                </div>
                {showResult && isCorrectOption && (
                  <div className="absolute top-2 right-2 bg-success rounded-full p-2">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
                {showResult && selectedAnswer === index && !isCorrectOption && (
                  <div className="absolute top-2 right-2 bg-destructive rounded-full p-2">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {question.type === "multiple_choice" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {question.options.map((option, index) => {
            const isCorrectOption = index === question.correctAnswer;
            return (
              <button
                key={index}
                onClick={() => handleAnswer(index, index === question.correctAnswer)}
                disabled={showResult}
                className={`relative overflow-hidden rounded-lg border-4 transition-all hover:scale-105 ${
                  showResult
                    ? isCorrectOption
                      ? "border-success shadow-glow"
                      : selectedAnswer === index
                      ? "border-destructive"
                      : "border-muted opacity-50"
                    : "border-primary/20 hover:border-primary"
                }`}
              >
                <div className="p-6 text-center">
                  <p className="text-lg font-semibold">{option}</p>
                </div>
                {showResult && isCorrectOption && (
                  <div className="absolute top-2 right-2 bg-success rounded-full p-2">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
                {showResult && selectedAnswer === index && !isCorrectOption && (
                  <div className="absolute top-2 right-2 bg-destructive rounded-full p-2">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {showResult && (
        <Button onClick={handleNext} className="w-full mt-6 gradient-candy" size="lg">
          {currentIndex < questions.length - 1 ? "Question suivante" : "Terminer"}
        </Button>
      )}
    </Card>
  );
};
