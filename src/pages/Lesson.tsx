import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Volume2, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { lessons } from "@/data/lessons";
import { supabase } from "@/integrations/supabase/client";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const progress = ((currentQuestion + 1) / lessonData.questions.length) * 100;
  const question = lessonData.questions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (showResult) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    
    if (index === question.correct) {
      setScore(score + 1);
      toast.success("Correct! Well done! 🎉");
    } else {
      toast.error("Not quite! Try again next time.");
    }
  };

  const handleNext = () => {
    if (currentQuestion < lessonData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      toast.success(`Lesson complete! Score: ${score + 1}/${lessonData.questions.length} 🎊`);
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
            Back to Dashboard
          </Button>
          
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold">{lessonData.title}</h1>
            <span className="text-sm text-muted-foreground">
              {currentQuestion + 1} / {lessonData.questions.length}
            </span>
          </div>
          
          <Progress value={progress} className="h-3" />
        </div>

        <Card className="p-8 shadow-candy border-2">
          <div className="text-center mb-8">
            {!showResult ? (
              <>
                <div className="text-8xl mb-6 animate-bounce-slow">{question.image}</div>
                <h2 className="text-2xl font-bold mb-2">{question.question}</h2>
                <Button variant="outline" size="sm" className="gap-2">
                  <Volume2 className="w-4 h-4" />
                  Play Audio
                </Button>
              </>
            ) : (
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-4">{question.question}</h2>
                <video
                  autoPlay
                  loop
                  muted
                  className="w-full max-w-md mx-auto rounded-lg shadow-candy border-2 border-primary/20"
                  src={question.videoUrl}
                >
                  Your browser does not support the video tag.
                </video>
                <p className="text-sm text-muted-foreground mt-4">
                  This is how to sign it correctly
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                variant="outline"
                disabled={showResult}
                className={`h-auto py-4 text-lg transition-all ${
                  showResult
                    ? index === question.correct
                      ? "gradient-success border-success"
                      : index === selectedAnswer
                      ? "bg-destructive/10 border-destructive"
                      : ""
                    : "hover:gradient-candy hover:text-primary-foreground"
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{option}</span>
                  {showResult && index === question.correct && (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  )}
                  {showResult && index === selectedAnswer && index !== question.correct && (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
              </Button>
            ))}
          </div>

          {showResult && (
            <Button
              onClick={handleNext}
              className="w-full mt-6 gradient-candy"
              size="lg"
            >
              {currentQuestion < lessonData.questions.length - 1 ? "Next Question" : "Complete Lesson"}
            </Button>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Lesson;
