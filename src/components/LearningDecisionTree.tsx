import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Stethoscope, Brain, Dumbbell, UserCheck, Heart, TestTube2, CheckCircle } from "lucide-react";
import { LevelTabs } from "./LevelTabs";
import { ExerciseSelector } from "./exercises/ExerciseSelector";
import { FlashCards } from "./exercises/FlashCards";
import { QuizExercise } from "./exercises/QuizExercise";
import { MatchingExercise } from "./exercises/MatchingExercise";
import { supabase } from "@/integrations/supabase/client";

type Step = "professions" | "level-test" | "lessons";

const professions = [
  { id: "logopédie", name: "Logopédie", icon: Heart },
  { id: "audiologie", name: "Audiologie", icon: Stethoscope },
  { id: "psychologie", name: "Psychologie", icon: Brain },
  { id: "médecine", name: "Médecine traitant", icon: TestTube2 },
  { id: "kinésithérapeute", name: "Kinésithérapeute", icon: Dumbbell },
  { id: "éducateur", name: "Éducateur spécialisé", icon: UserCheck },
];

// Questions du test de niveau
const levelTestQuestions = [
  {
    id: 1,
    question: "Savez-vous épeler votre nom en dactylologie (alphabet manuel) ?",
    options: ["Oui, couramment", "Quelques lettres seulement", "Non, pas du tout"],
    weights: { A1: [0, 1, 2], A2: [0, 0, 1], B1: [0, 0, 0], B2: [0, 0, 0] }
  },
  {
    id: 2,
    question: "Pouvez-vous comprendre les salutations de base en LSFB ?",
    options: ["Oui, facilement", "Avec difficulté", "Non"],
    weights: { A1: [0, 1, 2], A2: [0, 0, 1], B1: [0, 0, 0], B2: [0, 0, 0] }
  },
  {
    id: 3,
    question: "Êtes-vous capable de tenir une conversation simple sur des sujets quotidiens ?",
    options: ["Oui, avec aisance", "Oui, mais avec hésitations", "Non, pas encore"],
    weights: { A1: [0, 0, 0], A2: [0, 1, 2], B1: [0, 0, 1], B2: [0, 0, 0] }
  },
  {
    id: 4,
    question: "Comprenez-vous des récits ou explications en LSFB sur des sujets familiers ?",
    options: ["Oui, sans problème", "Partiellement", "Très peu ou pas"],
    weights: { A1: [0, 0, 0], A2: [0, 0, 1], B1: [0, 1, 2], B2: [0, 0, 0] }
  },
  {
    id: 5,
    question: "Pouvez-vous exprimer des opinions nuancées et argumenter en LSFB ?",
    options: ["Oui, couramment", "Avec des efforts", "Non"],
    weights: { A1: [0, 0, 0], A2: [0, 0, 0], B1: [0, 1, 2], B2: [0, 0, 1] }
  },
];

export const LearningDecisionTree = () => {
  const [currentStep, setCurrentStep] = useState<Step>("professions");
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [adultExerciseType, setAdultExerciseType] = useState<"flashcards" | "quiz" | "matching" | null>(null);
  const [alphabetData, setAlphabetData] = useState<any[]>([]);
  const [numbersData, setNumbersData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // État du test de niveau
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<"A1" | "A2" | "B1" | "B2" | null>(null);

  useEffect(() => {
    loadExerciseData();
  }, []);

  const loadExerciseData = async () => {
    try {
      const { data: alphabetSigns } = await supabase
        .from('alphabet_signs')
        .select('letter, video_url')
        .order('letter');

      if (alphabetSigns) {
        setAlphabetData(alphabetSigns);
      }

      const numbersWords = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
      const { data: numberSigns } = await supabase
        .from('word_signs')
        .select('word, video_url')
        .in('word', numbersWords);

      if (numberSigns) {
        setNumbersData(numberSigns);
      }
    } catch (error) {
      console.error('Error loading exercise data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfessionSelect = (professionId: string) => {
    setSelectedProfession(professionId);
    setCurrentStep("level-test");
  };

  const handleTestAnswer = (questionId: number, optionIndex: number) => {
    setTestAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const calculateLevel = () => {
    const scores = { A1: 0, A2: 0, B1: 0, B2: 0 };
    
    levelTestQuestions.forEach(q => {
      const answer = testAnswers[q.id];
      if (answer !== undefined) {
        scores.A1 += q.weights.A1[answer] || 0;
        scores.A2 += q.weights.A2[answer] || 0;
        scores.B1 += q.weights.B1[answer] || 0;
        scores.B2 += q.weights.B2[answer] || 0;
      }
    });

    // Déterminer le niveau recommandé
    if (scores.B2 >= 2) return "B2";
    if (scores.B1 >= 3) return "B1";
    if (scores.A2 >= 3) return "A2";
    return "A1";
  };

  const handleTestComplete = () => {
    const level = calculateLevel();
    setRecommendedLevel(level);
    setSelectedLevel(level);
    setTestCompleted(true);
  };

  const handleStartLearning = () => {
    setCurrentStep("lessons");
  };

  const handleBack = () => {
    if (adultExerciseType) {
      setAdultExerciseType(null);
      return;
    }

    if (currentStep === "level-test") {
      setCurrentStep("professions");
      setTestAnswers({});
      setTestCompleted(false);
      setRecommendedLevel(null);
    } else if (currentStep === "lessons") {
      setCurrentStep("level-test");
    }
  };

  // Prepare exercise data
  const getFlashCardsData = (type: "alphabet" | "numbers") => {
    if (type === "alphabet") {
      return alphabetData.map(item => ({
        front: item.letter,
        back: item.video_url,
        label: `Lettre ${item.letter}`
      }));
    } else {
      const numberMap: Record<string, string> = {
        "zéro": "0", "un": "1", "deux": "2", "trois": "3", "quatre": "4",
        "cinq": "5", "six": "6", "sept": "7", "huit": "8", "neuf": "9", "dix": "10"
      };
      return numbersData.map(item => ({
        front: numberMap[item.word] || item.word,
        back: item.video_url,
        label: item.word.charAt(0).toUpperCase() + item.word.slice(1)
      }));
    }
  };

  const getQuizData = (type: "alphabet" | "numbers") => {
    const data = type === "alphabet" ? alphabetData : numbersData;
    const numberMap: Record<string, string> = {
      "zéro": "0", "un": "1", "deux": "2", "trois": "3", "quatre": "4",
      "cinq": "5", "six": "6", "sept": "7", "huit": "8", "neuf": "9", "dix": "10"
    };

    return data.slice(0, 10).map((item) => {
      const allVideos = data.map(d => d.video_url).filter(Boolean);
      const correctAnswer = item.video_url;
      
      const distractors = allVideos
        .filter(v => v !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      
      const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

      return {
        question: type === "alphabet" ? item.letter : (numberMap[item.word] || item.word),
        questionLabel: type === "alphabet" ? `Lettre ${item.letter}` : item.word.charAt(0).toUpperCase() + item.word.slice(1),
        correctAnswer,
        options
      };
    });
  };

  const getMatchingData = (type: "alphabet" | "numbers") => {
    const data = type === "alphabet" ? alphabetData : numbersData;
    const numberMap: Record<string, string> = {
      "zéro": "0", "un": "1", "deux": "2", "trois": "3", "quatre": "4",
      "cinq": "5", "six": "6", "sept": "7", "huit": "8", "neuf": "9", "dix": "10"
    };

    return data.slice(0, 8).map(item => ({
      id: type === "alphabet" ? item.letter : item.word,
      text: type === "alphabet" ? item.letter : (numberMap[item.word] || item.word),
      video: item.video_url
    }));
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    if (selectedProfession) items.push(professions.find(p => p.id === selectedProfession)?.name || "");
    if (recommendedLevel && currentStep === "lessons") items.push(`Niveau ${recommendedLevel}`);

    return items.length > 0 ? (
      <div className="mb-6 text-sm text-muted-foreground flex items-center gap-2">
        <span>Parcours:</span>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span>›</span>}
            <span className="font-medium text-foreground">{item}</span>
          </span>
        ))}
      </div>
    ) : null;
  };

  const allQuestionsAnswered = Object.keys(testAnswers).length === levelTestQuestions.length;

  return (
    <div className="max-w-4xl mx-auto">
      {currentStep !== "professions" && (
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      )}

      {renderBreadcrumb()}

      {/* Étape 2a: Test de niveau */}
      {currentStep === "level-test" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {testCompleted ? "Résultat de votre test" : "Test de niveau LSFB"}
            </h2>
            <p className="text-muted-foreground">
              {testCompleted 
                ? "Voici le niveau recommandé pour votre apprentissage" 
                : "Répondez à ces questions pour évaluer votre niveau actuel"}
            </p>
          </div>

          {!testCompleted ? (
            <div className="space-y-6">
              {levelTestQuestions.map((q, qIndex) => (
                <Card key={q.id} className="p-6">
                  <h3 className="font-semibold mb-4">
                    {qIndex + 1}. {q.question}
                  </h3>
                  <div className="space-y-3">
                    {q.options.map((option, optionIndex) => (
                      <button
                        key={optionIndex}
                        onClick={() => handleTestAnswer(q.id, optionIndex)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          testAnswers[q.id] === optionIndex
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            testAnswers[q.id] === optionIndex
                              ? "border-primary bg-primary"
                              : "border-muted-foreground"
                          }`}>
                            {testAnswers[q.id] === optionIndex && (
                              <CheckCircle className="w-3 h-3 text-primary-foreground" />
                            )}
                          </div>
                          <span>{option}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </Card>
              ))}

              <div className="flex justify-center">
                <Button 
                  onClick={handleTestComplete}
                  disabled={!allQuestionsAnswered}
                  className="gradient-candy px-8 py-6 text-lg"
                >
                  <TestTube2 className="w-5 h-5 mr-2" />
                  Voir mon résultat
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="w-24 h-24 rounded-full gradient-candy flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl font-bold text-primary-foreground">{recommendedLevel}</span>
                </div>
                <h3 className="text-2xl font-bold mb-2">Niveau recommandé : {recommendedLevel}</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  {recommendedLevel === "A1" && "Vous débutez en LSFB. Commencez par les bases : alphabet, chiffres et salutations."}
                  {recommendedLevel === "A2" && "Vous avez des notions de base. Continuez à développer votre vocabulaire et vos premières phrases."}
                  {recommendedLevel === "B1" && "Vous avez un niveau intermédiaire. Travaillez sur les conversations et la compréhension."}
                  {recommendedLevel === "B2" && "Vous avez un bon niveau. Perfectionnez votre expression et abordez des sujets complexes."}
                </p>
              </Card>

              <div className="flex justify-center gap-4">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setTestAnswers({});
                    setTestCompleted(false);
                    setRecommendedLevel(null);
                  }}
                >
                  Refaire le test
                </Button>
                <Button 
                  onClick={handleStartLearning}
                  className="gradient-candy"
                >
                  Commencer l'apprentissage
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Étape 1: Choix de la profession */}
      {currentStep === "professions" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Commençons votre parcours d'apprentissage</h2>
            <p className="text-muted-foreground">Sélectionnez votre domaine professionnel</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professions.map((profession) => {
              const Icon = profession.icon;
              return (
                <Card 
                  key={profession.id}
                  className="p-6 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
                  onClick={() => handleProfessionSelect(profession.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full gradient-candy flex items-center justify-center mb-3">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">{profession.name}</h3>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Étape 3: Apprentissage par niveaux */}
      {currentStep === "lessons" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Votre parcours d'apprentissage</h2>
            <p className="text-muted-foreground">
              {professions.find(p => p.id === selectedProfession)?.name} - Niveau recommandé : {recommendedLevel}
            </p>
          </div>

          <LevelTabs selected={selectedLevel} onSelect={setSelectedLevel} />

          {selectedLevel === "A1" ? (
            adultExerciseType ? (
              <Card className="p-6 mt-6">
                {adultExerciseType === "flashcards" && (
                  <Tabs defaultValue="alphabet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                      <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                    </TabsList>
                    <TabsContent value="alphabet">
                      <FlashCards items={getFlashCardsData("alphabet")} title="Flash Cards - Alphabet" />
                    </TabsContent>
                    <TabsContent value="numbers">
                      <FlashCards items={getFlashCardsData("numbers")} title="Flash Cards - Chiffres" />
                    </TabsContent>
                  </Tabs>
                )}
                {adultExerciseType === "quiz" && (
                  <Tabs defaultValue="alphabet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                      <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                    </TabsList>
                    <TabsContent value="alphabet">
                      <QuizExercise items={getQuizData("alphabet")} title="Quiz - Alphabet" />
                    </TabsContent>
                    <TabsContent value="numbers">
                      <QuizExercise items={getQuizData("numbers")} title="Quiz - Chiffres" />
                    </TabsContent>
                  </Tabs>
                )}
                {adultExerciseType === "matching" && (
                  <Tabs defaultValue="alphabet" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                      <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                    </TabsList>
                    <TabsContent value="alphabet">
                      <MatchingExercise items={getMatchingData("alphabet")} title="Appariement - Alphabet" />
                    </TabsContent>
                    <TabsContent value="numbers">
                      <MatchingExercise items={getMatchingData("numbers")} title="Appariement - Chiffres" />
                    </TabsContent>
                  </Tabs>
                )}
              </Card>
            ) : (
              <Card className="p-6 mt-6">
                <ExerciseSelector onSelectExercise={setAdultExerciseType} />
              </Card>
            )
          ) : (
            <Card className="p-6 mt-6">
              <h3 className="text-xl font-bold mb-4">Leçons niveau {selectedLevel}</h3>
              <p className="text-muted-foreground text-center py-8">
                Les leçons pour le niveau {selectedLevel} seront affichées ici
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
