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

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const lessonData = lessons[id || "1"];

  // Redirect if lesson doesn't exist
  if (!lessonData) {
    navigate("/");
    return null;
  }

  const progress = ((currentQuestion + 1) / lessonData.questions.length) * 100;
  const question = lessonData.questions[currentQuestion];

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
    if (currentQuestion < lessonData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
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
              {t('lesson.question', { current: currentQuestion + 1, total: lessonData.questions.length })}
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
              {currentQuestion < lessonData.questions.length - 1 ? t('lesson.nextQuestion') : t('lesson.completeLesson')}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Lesson;
