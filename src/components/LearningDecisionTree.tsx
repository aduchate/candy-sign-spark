import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft, Stethoscope, Brain, Dumbbell, UserCheck, Heart, TestTube2, CheckCircle, BookOpen, GraduationCap, Users } from "lucide-react";
import { LevelTabs } from "./LevelTabs";
import { ExerciseSelector } from "./exercises/ExerciseSelector";
import { FlashCards } from "./exercises/FlashCards";
import { QuizExercise } from "./exercises/QuizExercise";
import { MatchingExercise } from "./exercises/MatchingExercise";
import { MultiVideoPlayer } from "@/components/MultiVideoPlayer";
import { supabase } from "@/integrations/supabase/client";
import { offlineCache, CACHE_KEYS } from "@/lib/offlineCache";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

type Step = "professions" | "level-test" | "categories";
type CategoryType = "glossaire" | "vocabulaire" | "culture";

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
    // "Oui" = skilled → points for higher levels; "Non" = beginner → points for A1
    weights: { A1: [0, 1, 3], A2: [1, 2, 0], B1: [2, 0, 0], B2: [3, 0, 0] }
  },
  {
    id: 2,
    question: "Pouvez-vous comprendre les salutations de base en LSFB ?",
    options: ["Oui, facilement", "Avec difficulté", "Non"],
    weights: { A1: [0, 1, 3], A2: [1, 2, 0], B1: [2, 0, 0], B2: [3, 0, 0] }
  },
  {
    id: 3,
    question: "Êtes-vous capable de tenir une conversation simple sur des sujets quotidiens ?",
    options: ["Oui, avec aisance", "Oui, mais avec hésitations", "Non, pas encore"],
    weights: { A1: [0, 0, 3], A2: [0, 2, 1], B1: [2, 1, 0], B2: [3, 0, 0] }
  },
  {
    id: 4,
    question: "Comprenez-vous des récits ou explications en LSFB sur des sujets familiers ?",
    options: ["Oui, sans problème", "Partiellement", "Très peu ou pas"],
    weights: { A1: [0, 0, 3], A2: [0, 1, 1], B1: [1, 2, 0], B2: [3, 0, 0] }
  },
  {
    id: 5,
    question: "Pouvez-vous exprimer des opinions nuancées et argumenter en LSFB ?",
    options: ["Oui, couramment", "Avec des efforts", "Non"],
    weights: { A1: [0, 0, 2], A2: [0, 0, 1], B1: [1, 2, 0], B2: [3, 1, 0] }
  },
];

// Vocabulaire professionnel par profession et par niveau
const professionVocabulary: Record<string, Record<string, string[]>> = {
  "logopédie": {
    A1: ["Bonjour", "Merci", "comment", "vous", "bouche", "parler"],
    A2: ["langue", "voix", "son", "mot", "phrase", "entendre", "comprendre", "exercice"],
    B1: ["articulation", "prononciation", "bégaiement", "rééducation", "déglutition", "thérapie", "bilan", "diagnostic"],
    B2: ["trouble", "dysphasie", "aphasie", "neurologie", "programme", "évaluation", "progrès", "réunion", "projet"],
  },
  "audiologie": {
    A1: ["Bonjour", "Merci", "comment", "vous", "oreille", "entendre", "son"],
    A2: ["bruit", "silence", "fort", "faible", "appareil", "gauche", "droite"],
    B1: ["audiogramme", "surdité", "prothèse", "fréquence", "décibel", "acouphène", "implant", "calibrage"],
    B2: ["presbyacousie", "otoscopie", "tympanométrie", "réhabilitation", "programme", "diagnostic", "réunion", "projet", "directeur"],
  },
  "psychologie": {
    A1: ["Bonjour", "Merci", "comment", "vous", "content", "triste", "peur"],
    A2: ["colere", "surpris", "fatigue", "parler", "comprendre", "aider", "famille"],
    B1: ["anxiété", "dépression", "thérapie", "séance", "confiance", "stress", "soutien"],
    B2: ["traumatisme", "résilience", "inconscient", "transfert", "diagnostic", "évaluation", "programme", "réunion", "projet"],
  },
  "médecine": {
    A1: ["Bonjour", "Merci", "comment", "vous", "mal", "bien", "où"],
    A2: ["douleur", "ventre", "dos", "repos", "eau", "manger"],
    B1: ["ordonnance", "examen", "résultat", "tension", "allergie", "chirurgie", "urgence"],
    B2: ["pathologie", "anesthésie", "intervention", "scanner", "diagnostic", "pronostic", "programme", "réunion", "projet"],
  },
  "kinésithérapeute": {
    A1: ["Bonjour", "Merci", "comment", "vous", "mal", "bouger", "marcher"],
    A2: ["douleur", "dos", "jambe", "bras", "exercice", "repos", "courir", "sauter"],
    B1: ["articulation", "muscle", "étirement", "renforcement", "rééducation", "posture", "équilibre", "séance"],
    B2: ["tendinite", "fracture", "prothèse", "réhabilitation", "programme", "bilan", "diagnostic", "réunion", "projet"],
  },
  "éducateur": {
    A1: ["Bonjour", "Merci", "comment", "vous", "jouer", "manger", "dormir"],
    A2: ["maison", "famille", "ami", "aider", "apprendre", "comprendre"],
    B1: ["autonomie", "socialisation", "comportement", "objectif", "activité", "progrès", "accompagnement"],
    B2: ["inclusion", "handicap", "projet", "évaluation", "programme", "partenariat", "diagnostic", "réunion", "directeur"],
  },
};

export const LearningDecisionTree = () => {
  const [currentStep, setCurrentStep] = useState<Step>("professions");
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | null>(null);
  const [adultExerciseType, setAdultExerciseType] = useState<"flashcards" | "quiz" | "matching" | null>(null);
  const [alphabetData, setAlphabetData] = useState<any[]>([]);
  const [numbersData, setNumbersData] = useState<any[]>([]);
  const [glossaryWords, setGlossaryWords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOnlineStatus();

  // État du test de niveau
  const [testAnswers, setTestAnswers] = useState<Record<number, number>>({});
  const [testCompleted, setTestCompleted] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<"A1" | "A2" | "B1" | "B2" | null>(null);
  const [professionWords, setProfessionWords] = useState<any[]>([]);

  useEffect(() => {
    loadExerciseData();
  }, []);

  const loadExerciseData = async () => {
    try {
      if (!isOnline) {
        // Load from cache when offline
        const cachedAlphabet = offlineCache.get<any[]>(CACHE_KEYS.ALPHABET_SIGNS);
        const cachedNumbers = offlineCache.get<any[]>('numbers_signs');
        if (cachedAlphabet) setAlphabetData(cachedAlphabet);
        if (cachedNumbers) setNumbersData(cachedNumbers);
        setLoading(false);
        return;
      }

      const { data: alphabetSigns } = await supabase
        .from('alphabet_signs')
        .select('letter, video_url')
        .order('letter');

      if (alphabetSigns) {
        setAlphabetData(alphabetSigns);
        offlineCache.set(CACHE_KEYS.ALPHABET_SIGNS, alphabetSigns);
      }

      const numbersWords = ["zéro", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix"];
      const { data: numberSigns } = await supabase
        .from('word_signs')
        .select('word, video_url')
        .in('word', numbersWords);

      if (numberSigns) {
        const groupedNumbers = (numberSigns ?? []).reduce<Record<string, { video_urls: string[] }>>((acc, row) => {
          const key = row.word.toLowerCase();
          if (!acc[key]) {
            acc[key] = { video_urls: [] };
          }
          if (row.video_url) acc[key].video_urls.push(row.video_url);
          return acc;
        }, {});
        const groupedNumbersData = Object.entries(groupedNumbers).map(([word, info]) => ({
          word,
          video_urls: info.video_urls,
        }));
        setNumbersData(groupedNumbersData);
        offlineCache.set('numbers_signs', groupedNumbersData);
      }
    } catch (error) {
      console.error('Error loading exercise data:', error);
      // Fallback to cache
      const cachedAlphabet = offlineCache.get<any[]>(CACHE_KEYS.ALPHABET_SIGNS);
      const cachedNumbers = offlineCache.get<any[]>('numbers_signs');
      if (cachedAlphabet) setAlphabetData(cachedAlphabet);
      if (cachedNumbers) setNumbersData(cachedNumbers);
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

    // Higher score = more likely that level. "Oui" answers boost B1/B2.
    const maxScore = Math.max(scores.A1, scores.A2, scores.B1, scores.B2);
    if (scores.B2 === maxScore) return "B2";
    if (scores.B1 === maxScore) return "B1";
    if (scores.A2 === maxScore) return "A2";
    return "A1";
  };

  const handleTestComplete = () => {
    const level = calculateLevel();
    setRecommendedLevel(level);
    setSelectedLevel(level);
    setTestCompleted(true);
    // Load profession-specific vocabulary from Supabase
    if (selectedProfession) {
      loadProfessionVocabulary(selectedProfession, level);
    }
  };


  const loadProfessionVocabulary = async (profession: string, level: string) => {
    const vocab = professionVocabulary[profession]?.[level] || [];
    if (vocab.length === 0) return;

    const cacheKey = `profession_vocab_${profession}_${level}`;

    if (!isOnline) {
      const cached = offlineCache.get<any[]>(cacheKey);
      if (cached) setProfessionWords(cached);
      return;
    }

    try {
      const { data } = await supabase
        .from('word_signs')
        .select('word, video_url, phrase, signed_grammar')
        .in('word', vocab.map(w => w.toLowerCase()));

      if (data && data.length > 0) {
        const grouped = (data ?? []).reduce<Record<string, { video_urls: string[]; phrase?: string; signed_grammar?: string }>>((acc, row) => {
          const key = row.word.toLowerCase();
          if (!acc[key]) {
            acc[key] = { video_urls: [], phrase: row.phrase, signed_grammar: row.signed_grammar };
          }
          if (row.video_url) acc[key].video_urls.push(row.video_url);
          return acc;
        }, {});
        const groupedData = Object.entries(grouped).map(([word, info]) => ({
          word,
          video_urls: info.video_urls,
          phrase: info.phrase,
          signed_grammar: info.signed_grammar,
        }));
        setProfessionWords(groupedData);
        offlineCache.set(cacheKey, groupedData);
      }
    } catch (err) {
      console.error('Error loading profession vocabulary:', err);
      const cached = offlineCache.get<any[]>(cacheKey);
      if (cached) setProfessionWords(cached);
    }
  };

  const handleStartLearning = () => {
    setCurrentStep("categories");
  };

  const handleCategorySelect = (category: CategoryType) => {
    setSelectedCategory(category);
  };

  const handleBack = () => {
    if (adultExerciseType) {
      setAdultExerciseType(null);
      return;
    }

    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }

    if (currentStep === "level-test") {
      setCurrentStep("professions");
      setTestAnswers({});
      setTestCompleted(false);
      setRecommendedLevel(null);
    } else if (currentStep === "categories") {
      setCurrentStep("level-test");
    }
  };

  // Prepare exercise data
  const getFlashCardsData = (type: "alphabet" | "numbers") => {
    if (type === "alphabet") {
      return alphabetData.map(item => ({
        front: item.letter,
        back: [item.video_url].filter(Boolean),
        label: `Lettre ${item.letter}`
      }));
    } else {
      const numberMap: Record<string, string> = {
        "zéro": "0", "un": "1", "deux": "2", "trois": "3", "quatre": "4",
        "cinq": "5", "six": "6", "sept": "7", "huit": "8", "neuf": "9", "dix": "10"
      };
      return numbersData.map(item => ({
        front: numberMap[item.word] || item.word,
        back: item.video_urls ?? [item.video_url].filter(Boolean),
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
      const allVideos = data.map(d => type === "alphabet" ? d.video_url : (d.video_urls?.[0] ?? d.video_url)).filter(Boolean);
      const correctAnswer = type === "alphabet" ? item.video_url : (item.video_urls?.[0] ?? item.video_url);

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
      video: type === "alphabet" ? [item.video_url].filter(Boolean) : (item.video_urls ?? [item.video_url].filter(Boolean))
    }));
  };

  const getProfessionFlashCards = () => {
    return professionWords.map(item => ({
      front: item.word.charAt(0).toUpperCase() + item.word.slice(1),
      back: item.video_urls ?? [item.video_url].filter(Boolean),
      label: item.word.charAt(0).toUpperCase() + item.word.slice(1)
    }));
  };

  const getProfessionQuizData = () => {
    return professionWords.slice(0, 10).map((item) => {
      const allVideos = professionWords.map(d => d.video_urls?.[0] ?? d.video_url).filter(Boolean);
      const correctAnswer = item.video_urls?.[0] ?? item.video_url;
      const distractors = allVideos
        .filter(v => v !== correctAnswer)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
      const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);
      return {
        question: item.word.charAt(0).toUpperCase() + item.word.slice(1),
        questionLabel: item.word.charAt(0).toUpperCase() + item.word.slice(1),
        correctAnswer,
        options
      };
    });
  };

  const getProfessionMatchingData = () => {
    return professionWords.slice(0, 8).map(item => ({
      id: item.word,
      text: item.word.charAt(0).toUpperCase() + item.word.slice(1),
      video: item.video_urls ?? [item.video_url].filter(Boolean)
    }));
  };

  const renderBreadcrumb = () => {
    const items = [];

    if (selectedProfession) items.push(professions.find(p => p.id === selectedProfession)?.name || "");
    if (recommendedLevel && currentStep === "categories") items.push(`Niveau ${recommendedLevel}`);
    if (selectedCategory) {
      const categoryNames: Record<CategoryType, string> = {
        glossaire: "Glossaire",
        vocabulaire: "Vocabulaire",
        culture: "Culture sourde"
      };
      items.push(categoryNames[selectedCategory]);
    }

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

      {/* Étape 3: Catégories d'apprentissage */}
      {currentStep === "categories" && !selectedCategory && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Votre parcours d'apprentissage</h2>
            <p className="text-muted-foreground">
              {professions.find(p => p.id === selectedProfession)?.name} - Niveau : {recommendedLevel}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              className="p-6 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleCategorySelect("glossaire")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Mon Glossaire</h3>
                <p className="text-muted-foreground text-sm">
                  Les mots que vous avez appris et utilisés, regroupés pour révision
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  {glossaryWords.length} mots appris
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleCategorySelect("vocabulaire")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full gradient-candy flex items-center justify-center mb-4">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Vocabulaire Professionnel</h3>
                <p className="text-muted-foreground text-sm">
                  Apprenez le vocabulaire spécifique à votre profession
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Exercices et leçons adaptés
                </div>
              </div>
            </Card>

            <Card
              className="p-6 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleCategorySelect("culture")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">Culture Sourde</h3>
                <p className="text-muted-foreground text-sm">
                  Règles et bonnes pratiques pour interagir avec vos patients sourds
                </p>
                <div className="mt-4 text-xs text-muted-foreground">
                  Quiz et conseils pratiques
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Contenu du Glossaire */}
      {currentStep === "categories" && selectedCategory === "glossaire" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Mon Glossaire Personnel</h2>
            <p className="text-muted-foreground">
              Les mots que vous avez appris au fil de votre apprentissage
            </p>
          </div>

          <Card className="p-6">
            {glossaryWords.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Votre glossaire est vide</h3>
                <p className="text-muted-foreground mb-4">
                  Commencez à apprendre du vocabulaire pour remplir votre glossaire personnel
                </p>
                <Button onClick={() => setSelectedCategory("vocabulaire")} className="gradient-candy">
                  Commencer l'apprentissage
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {glossaryWords.map((word, index) => (
                  <Card key={index} className="p-4 text-center">
                    <p className="font-semibold">{word.word}</p>
                    {word.video_urls?.length > 0 && (
                      <MultiVideoPlayer
                        videoUrls={word.video_urls}
                        className="w-full h-20 object-cover mt-2 rounded"
                        autoPlay={false}
                        loop={true}
                        muted={true}
                      />
                    )}
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Contenu du Vocabulaire Professionnel */}
      {currentStep === "categories" && selectedCategory === "vocabulaire" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Vocabulaire Professionnel</h2>
            <p className="text-muted-foreground">
              {professions.find(p => p.id === selectedProfession)?.name} - Niveau {selectedLevel}
            </p>
          </div>

          <LevelTabs selected={selectedLevel} onSelect={(lvl) => {
            setSelectedLevel(lvl);
            if (selectedProfession) loadProfessionVocabulary(selectedProfession, lvl);
          }} />

          {professionWords.length > 0 && (
            <Card className="p-4 mt-4">
              <h4 className="font-semibold mb-2">Vocabulaire adapté — {professions.find(p => p.id === selectedProfession)?.name} ({selectedLevel})</h4>
              <p className="text-sm text-muted-foreground mb-3">
                {professionWords.length} signe(s) disponible(s) pour votre niveau et profession
              </p>
            </Card>
          )}

          {adultExerciseType ? (
            <Card className="p-6 mt-6">
              {adultExerciseType === "flashcards" && (
                <Tabs defaultValue={professionWords.length > 0 ? "profession" : "alphabet"} className="w-full">
                  <TabsList className={`grid w-full mb-6 ${professionWords.length > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {professionWords.length > 0 && <TabsTrigger value="profession">Professionnel</TabsTrigger>}
                    <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                    <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                  </TabsList>
                  {professionWords.length > 0 && (
                    <TabsContent value="profession">
                      <FlashCards items={getProfessionFlashCards()} title={`Flash Cards - ${professions.find(p => p.id === selectedProfession)?.name}`} />
                    </TabsContent>
                  )}
                  <TabsContent value="alphabet">
                    <FlashCards items={getFlashCardsData("alphabet")} title="Flash Cards - Alphabet" />
                  </TabsContent>
                  <TabsContent value="numbers">
                    <FlashCards items={getFlashCardsData("numbers")} title="Flash Cards - Chiffres" />
                  </TabsContent>
                </Tabs>
              )}
              {adultExerciseType === "quiz" && (
                <Tabs defaultValue={professionWords.length > 0 ? "profession" : "alphabet"} className="w-full">
                  <TabsList className={`grid w-full mb-6 ${professionWords.length > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {professionWords.length > 0 && <TabsTrigger value="profession">Professionnel</TabsTrigger>}
                    <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                    <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                  </TabsList>
                  {professionWords.length > 0 && (
                    <TabsContent value="profession">
                      <QuizExercise items={getProfessionQuizData()} title={`Quiz - ${professions.find(p => p.id === selectedProfession)?.name}`} />
                    </TabsContent>
                  )}
                  <TabsContent value="alphabet">
                    <QuizExercise items={getQuizData("alphabet")} title="Quiz - Alphabet" />
                  </TabsContent>
                  <TabsContent value="numbers">
                    <QuizExercise items={getQuizData("numbers")} title="Quiz - Chiffres" />
                  </TabsContent>
                </Tabs>
              )}
              {adultExerciseType === "matching" && (
                <Tabs defaultValue={professionWords.length > 0 ? "profession" : "alphabet"} className="w-full">
                  <TabsList className={`grid w-full mb-6 ${professionWords.length > 0 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {professionWords.length > 0 && <TabsTrigger value="profession">Professionnel</TabsTrigger>}
                    <TabsTrigger value="alphabet">Alphabet</TabsTrigger>
                    <TabsTrigger value="numbers">Chiffres</TabsTrigger>
                  </TabsList>
                  {professionWords.length > 0 && (
                    <TabsContent value="profession">
                      <MatchingExercise items={getProfessionMatchingData()} title={`Appariement - ${professions.find(p => p.id === selectedProfession)?.name}`} />
                    </TabsContent>
                  )}
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
          )}
        </div>
      )}

      {/* Contenu de la Culture Sourde */}
      {currentStep === "categories" && selectedCategory === "culture" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Culture Sourde</h2>
            <p className="text-muted-foreground">
              Apprenez les bonnes pratiques pour interagir avec vos patients sourds signants
            </p>
          </div>

          <div className="grid gap-4">
            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Règles de communication
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Maintenez toujours le contact visuel lors de la communication</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Attirez l'attention en faisant un signe de la main ou en touchant légèrement l'épaule</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Parlez face à la personne et ne couvrez pas votre bouche</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Utilisez des expressions faciales - elles font partie de la langue des signes</span>
                </li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="text-xl font-bold mb-4">Quiz - Testez vos connaissances</h3>
              <p className="text-muted-foreground text-center py-8">
                Les quiz sur la culture sourde seront bientôt disponibles
              </p>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};
