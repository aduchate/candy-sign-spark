import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { lessons } from "@/data/lessons";
import { SentenceOrderingExercise } from "@/components/SentenceOrderingExercise";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [lessonData, setLessonData] = useState<any>(null);
  const [isNewFormat, setIsNewFormat] = useState(false);

  useEffect(() => {
    const loadLesson = async () => {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      // Try to load from new format first
      const { data: newLesson, error } = await supabase
        .from('lessons')
        .select('*, exercises(*)')
        .eq('id', id)
        .maybeSingle();

      if (newLesson && !error) {
        setLessonData(newLesson);
        setIsNewFormat(true);
      } else {
        // Fallback to old format
        const oldLesson = lessons[id || "1"];
        if (oldLesson) {
          setLessonData(oldLesson);
          setIsNewFormat(false);
        } else {
          navigate("/");
          return;
        }
      }

      setLoading(false);
    };

    loadLesson();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!lessonData) {
    navigate("/");
    return null;
  }

  // Handle new format with exercises
  if (isNewFormat) {
    const exercises = lessonData.exercises?.sort((a: any, b: any) => a.order_index - b.order_index) || [];
    
    // If no exercises, show empty state
    if (exercises.length === 0) {
      return (
        <div className="min-h-screen p-4">
          <div className="container mx-auto max-w-2xl">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>
            <Card className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Cette leçon n'a pas encore d'exercices</h2>
              <p className="text-muted-foreground mb-6">
                Les exercices seront bientôt disponibles pour cette leçon.
              </p>
              <Button onClick={() => navigate("/")} className="gradient-candy">
                Retour au tableau de bord
              </Button>
            </Card>
          </div>
        </div>
      );
    }

    const progress = ((currentExercise + 1) / exercises.length) * 100;
    const exercise = exercises[currentExercise];
    
    // Safety check for exercise
    if (!exercise) {
      console.error("Exercise not found at index:", currentExercise);
      navigate("/");
      return null;
    }

    const handleExerciseComplete = async (correct: boolean, timeSpent: number) => {
      if (correct) {
        setScore(score + 1);
      }

      if (currentExercise < exercises.length - 1) {
        setTimeout(() => {
          setCurrentExercise(currentExercise + 1);
        }, 1500);
      } else {
        const finalScore = correct ? score + 1 : score;
        toast.success(t('lesson.lessonComplete', { score: finalScore, total: exercises.length }));

        // Save progress
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const progressPercentage = Math.round((finalScore / exercises.length) * 100);

          const { data: existingProgress } = await supabase
            .from('user_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('lesson_id', id)
            .maybeSingle();

          if (existingProgress) {
            if (finalScore > existingProgress.score) {
              await supabase
                .from('user_progress')
                .update({
                  score: finalScore,
                  total_questions: exercises.length,
                  completed: progressPercentage === 100,
                  completed_at: progressPercentage === 100 ? new Date().toISOString() : existingProgress.completed_at,
                  best_time: timeSpent
                })
                .eq('id', existingProgress.id);
            }
          } else {
            await supabase
              .from('user_progress')
              .insert({
                user_id: user.id,
                lesson_id: id || "",
                score: finalScore,
                total_questions: exercises.length,
                completed: progressPercentage === 100,
                completed_at: progressPercentage === 100 ? new Date().toISOString() : null,
                best_time: timeSpent
              });
          }
        }

        setTimeout(() => navigate("/"), 2000);
      }
    };

    return (
      <div className="min-h-screen p-4">
        <div className="container mx-auto max-w-2xl">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2 mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              {t('common.back')}
            </Button>

            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{lessonData.title}</h1>
              <span className="text-sm text-muted-foreground">
                {currentExercise + 1}/{exercises.length}
              </span>
            </div>

            <Progress value={progress} className="h-3" />
          </div>

          <Card className="p-8 shadow-candy border-2">
            {exercise.type === "sentence_ordering" && (
              <SentenceOrderingExercise
                exerciseId={exercise.id}
                words={exercise.content.words}
                correctOrder={exercise.content.correctOrder}
                fullSentenceVideo={exercise.content.fullSentenceVideo}
                onComplete={handleExerciseComplete}
              />
            )}

            {exercise.type === "multiple_choice" && (
              <div>
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-4">{exercise.content.question}</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {exercise.content.options.map((option: string, index: number) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (showResult) return;
                        setSelectedAnswer(index);
                        setShowResult(true);
                        if (index === exercise.content.correct) {
                          setScore(score + 1);
                          toast.success(t('lesson.correct'));
                        } else {
                          toast.error(t('lesson.incorrect'));
                        }
                      }}
                      disabled={showResult}
                      className={`relative overflow-hidden rounded-lg border-4 transition-all hover:scale-105 ${
                        showResult
                          ? index === exercise.content.correct
                            ? "border-success shadow-glow"
                            : index === selectedAnswer
                            ? "border-destructive"
                            : "border-muted opacity-50"
                          : "border-primary/20 hover:border-primary"
                      }`}
                    >
                      <div className="p-6 text-center">
                        <p className="text-lg font-semibold">{option}</p>
                      </div>
                      {showResult && index === exercise.content.correct && (
                        <div className="absolute top-2 right-2 bg-success rounded-full p-2">
                          <CheckCircle2 className="w-6 h-6 text-white" />
                        </div>
                      )}
                      {showResult && index === selectedAnswer && index !== exercise.content.correct && (
                        <div className="absolute top-2 right-2 bg-destructive rounded-full p-2">
                          <XCircle className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {showResult && (
                  <Button
                    onClick={() => handleExerciseComplete(selectedAnswer === exercise.content.correct, 0)}
                    className="w-full mt-6 gradient-candy"
                    size="lg"
                  >
                    {currentExercise < exercises.length - 1 ? t('lesson.nextQuestion') : t('lesson.completeLesson')}
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // Handle old format with questions
  const progress = ((currentExercise + 1) / lessonData.questions.length) * 100;
  const question = lessonData.questions[currentExercise];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correct) {
      setScore(score + 1);
      toast.success(t('lesson.correct'));
    } else {
      toast.error(t('lesson.incorrect'));
    }
  };

  const handleNext = async () => {
    if (currentExercise < lessonData.questions.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      const finalScore = score;
      toast.success(t('lesson.lessonComplete', { score: finalScore, total: lessonData.questions.length }));
      
      // Save progress to database
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const progressPercentage = Math.round((finalScore / lessonData.questions.length) * 100);
        
        // Check if progress exists for this lesson
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('lesson_id', id)
          .maybeSingle();

        if (existingProgress) {
          // Update existing progress only if new score is better
          if (finalScore > existingProgress.score) {
            await supabase
              .from('user_progress')
              .update({
                score: finalScore,
                total_questions: lessonData.questions.length,
                completed: progressPercentage === 100,
                completed_at: progressPercentage === 100 ? new Date().toISOString() : existingProgress.completed_at
              })
              .eq('id', existingProgress.id);
          }
        } else {
          // Insert new progress
          await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              lesson_id: id || "1",
              score: finalScore,
              total_questions: lessonData.questions.length,
              completed: progressPercentage === 100,
              completed_at: progressPercentage === 100 ? new Date().toISOString() : null
            });
        }
      }
      
      setTimeout(() => navigate("/"), 2000);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-2xl">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Button>
          
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{lessonData.title}</h1>
              <span className="text-sm text-muted-foreground">
                {t('lesson.question', { current: currentExercise + 1, total: lessonData.questions.length })}
              </span>
            </div>
          
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="p-8 shadow-candy border-2">
          <div className="text-center mb-8">
            <div className="text-8xl mb-6 animate-bounce-slow">{question.image}</div>
            <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                disabled={showResult}
                className={`relative overflow-hidden rounded-lg border-4 transition-all hover:scale-105 ${
                  showResult
                    ? index === question.correct
                      ? "border-success shadow-glow"
                      : index === selectedAnswer
                      ? "border-destructive"
                      : "border-muted opacity-50"
                    : "border-primary/20 hover:border-primary"
                }`}
              >
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-48 object-cover"
                  src={question.optionVideos[index]}
                >
                  Votre navigateur ne supporte pas la vidéo.
                </video>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-semibold">{option}</p>
                </div>
                {showResult && index === question.correct && (
                  <div className="absolute top-2 right-2 bg-success rounded-full p-2">
                    <CheckCircle2 className="w-6 h-6 text-white" />
                  </div>
                )}
                {showResult && index === selectedAnswer && index !== question.correct && (
                  <div className="absolute top-2 right-2 bg-destructive rounded-full p-2">
                    <XCircle className="w-6 h-6 text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {showResult && (
            <Button
                onClick={handleNext}
                className="w-full mt-6 gradient-candy"
                size="lg"
              >
                {currentExercise < lessonData.questions.length - 1 ? t('lesson.nextQuestion') : t('lesson.completeLesson')}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Lesson;
