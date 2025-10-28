import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";

interface Question {
  id: number;
  question: string;
  type: "true-false" | "single-choice" | "multiple-choice";
  options?: string[];
  correctAnswer?: string | string[];
  explanation?: string;
}

// Questions placeholder - à remplir par l'utilisateur
const questions: Question[] = [
  {
    id: 1,
    question: "Les personnes sourdes ne peuvent pas conduire une voiture",
    type: "true-false",
    correctAnswer: "false",
    explanation: "Explication à ajouter..."
  },
  {
    id: 2,
    question: "Question vrai/faux à compléter...",
    type: "true-false",
    correctAnswer: "true",
    explanation: "Explication à ajouter..."
  },
  {
    id: 3,
    question: "Question à choix unique à compléter...",
    type: "single-choice",
    options: [
      "Option A - à compléter",
      "Option B - à compléter",
      "Option C - à compléter",
      "Option D - à compléter"
    ],
    correctAnswer: "Option A - à compléter",
    explanation: "Explication à ajouter..."
  },
  {
    id: 4,
    question: "Question à choix unique à compléter...",
    type: "single-choice",
    options: [
      "Option A - à compléter",
      "Option B - à compléter",
      "Option C - à compléter"
    ],
    correctAnswer: "Option A - à compléter",
    explanation: "Explication à ajouter..."
  },
  {
    id: 5,
    question: "Question à choix multiples à compléter (plusieurs bonnes réponses possibles)...",
    type: "multiple-choice",
    options: [
      "Option A - à compléter",
      "Option B - à compléter",
      "Option C - à compléter",
      "Option D - à compléter"
    ],
    correctAnswer: ["Option A - à compléter", "Option C - à compléter"],
    explanation: "Explication à ajouter..."
  }
];

export const StereotypeQuiz = () => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleTrueFalseAnswer = (answer: string) => {
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: answer });
  };

  const handleSingleChoiceAnswer = (answer: string) => {
    setUserAnswers({ ...userAnswers, [currentQuestion.id]: answer });
  };

  const handleMultipleChoiceAnswer = (option: string, checked: boolean) => {
    const currentAnswers = (userAnswers[currentQuestion.id] as string[]) || [];
    if (checked) {
      setUserAnswers({ ...userAnswers, [currentQuestion.id]: [...currentAnswers, option] });
    } else {
      setUserAnswers({
        ...userAnswers,
        [currentQuestion.id]: currentAnswers.filter(a => a !== option)
      });
    }
  };

  const checkAnswer = (questionId: number): boolean => {
    const question = questions.find(q => q.id === questionId);
    const userAnswer = userAnswers[questionId];

    if (!question || !userAnswer) return false;

    if (question.type === "multiple-choice") {
      const correctAnswers = question.correctAnswer as string[];
      const userAnswerArray = userAnswer as string[];
      return (
        correctAnswers.length === userAnswerArray.length &&
        correctAnswers.every(a => userAnswerArray.includes(a))
      );
    }

    return userAnswer === question.correctAnswer;
  };

  const handleNext = () => {
    if (!userAnswers[currentQuestion.id]) {
      toast.error("Veuillez sélectionner une réponse");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateScore();
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    questions.forEach(question => {
      if (checkAnswer(question.id)) {
        correctAnswers++;
      }
    });
    setScore(correctAnswers);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setScore(0);
  };

  if (showResults) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Résultats</h2>
            <div className="text-6xl font-bold mb-4">
              {score} / {questions.length}
            </div>
            <p className="text-xl text-muted-foreground">
              {score === questions.length
                ? "Parfait ! Vous avez déconstruit tous les stéréotypes !"
                : score >= questions.length / 2
                ? "Bon travail ! Continuez à apprendre."
                : "Il y a encore des stéréotypes à déconstruire."}
            </p>
          </div>

          <div className="space-y-6 mb-8">
            {questions.map((question, index) => {
              const isCorrect = checkAnswer(question.id);
              return (
                <Card key={question.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">
                      {isCorrect ? (
                        <CheckCircle2 className="w-6 h-6 text-success" />
                      ) : (
                        <XCircle className="w-6 h-6 text-destructive" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">
                        Question {index + 1}: {question.question}
                      </h3>
                      <div className="text-sm space-y-2">
                        <p>
                          <span className="font-semibold">Votre réponse: </span>
                          {Array.isArray(userAnswers[question.id])
                            ? (userAnswers[question.id] as string[]).join(", ")
                            : userAnswers[question.id] === "true"
                            ? "Vrai"
                            : userAnswers[question.id] === "false"
                            ? "Faux"
                            : userAnswers[question.id]}
                        </p>
                        <p>
                          <span className="font-semibold">Réponse correcte: </span>
                          {Array.isArray(question.correctAnswer)
                            ? question.correctAnswer.join(", ")
                            : question.correctAnswer === "true"
                            ? "Vrai"
                            : question.correctAnswer === "false"
                            ? "Faux"
                            : question.correctAnswer}
                        </p>
                        {question.explanation && (
                          <div className="mt-2 p-3 bg-muted rounded-md">
                            <p className="flex items-start gap-2">
                              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                              <span>{question.explanation}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Button onClick={resetQuiz} className="w-full">
            Recommencer le quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Quiz sur les Stéréotypes</h2>
            <span className="text-muted-foreground">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <p className="text-muted-foreground mb-6">
            Testez vos connaissances sur la culture sourde et malentendante
          </p>
        </div>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-6">{currentQuestion.question}</h3>

          {currentQuestion.type === "true-false" && (
            <RadioGroup
              value={userAnswers[currentQuestion.id] as string}
              onValueChange={handleTrueFalseAnswer}
              className="space-y-4"
            >
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="true" id="true" />
                <Label htmlFor="true" className="cursor-pointer flex-1">
                  Vrai
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                <RadioGroupItem value="false" id="false" />
                <Label htmlFor="false" className="cursor-pointer flex-1">
                  Faux
                </Label>
              </div>
            </RadioGroup>
          )}

          {currentQuestion.type === "single-choice" && (
            <RadioGroup
              value={userAnswers[currentQuestion.id] as string}
              onValueChange={handleSingleChoiceAnswer}
              className="space-y-4"
            >
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer"
                >
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          )}

          {currentQuestion.type === "multiple-choice" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground mb-4">
                (Plusieurs réponses possibles)
              </p>
              {currentQuestion.options?.map((option, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50"
                >
                  <Checkbox
                    id={`multiple-${index}`}
                    checked={
                      ((userAnswers[currentQuestion.id] as string[]) || []).includes(option)
                    }
                    onCheckedChange={(checked) =>
                      handleMultipleChoiceAnswer(option, checked as boolean)
                    }
                  />
                  <Label htmlFor={`multiple-${index}`} className="cursor-pointer flex-1">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
          >
            Précédent
          </Button>
          <Button onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? "Suivant" : "Terminer"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
