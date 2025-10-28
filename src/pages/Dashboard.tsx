import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, Trophy, Target, BarChart3, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { User } from "@supabase/supabase-js";
import { useTranslation } from "react-i18next";
import { lessons as lessonsData } from "@/data/lessons";
import ReactMarkdown from "react-markdown";
import lsfbAlphabet from "@/assets/lsfb-alphabet.jpg";
import lsfbNumbers from "@/assets/lsfb-numbers.jpg";
import lsfbGreetings from "@/assets/lsfb-greetings.jpg";
import { AlphabetGrid } from "@/components/AlphabetGrid";
import { NumbersGrid } from "@/components/NumbersGrid";
import { LSFBDictionary } from "@/components/LSFBDictionary";
import { SentenceTranslator } from "@/components/SentenceTranslator";
import { ProfileSelector } from "@/components/ProfileSelector";
import { LevelTabs } from "@/components/LevelTabs";
import { LessonCard } from "@/components/LessonCard";
import { GreetingsGrid } from "@/components/GreetingsGrid";
import { AnimalsGrid } from "@/components/AnimalsGrid";
import { ColorsGrid } from "@/components/ColorsGrid";
import { FamilyGrid } from "@/components/FamilyGrid";
import { EmotionsGrid } from "@/components/EmotionsGrid";
import { FoodGrid } from "@/components/FoodGrid";
import { ToysGrid } from "@/components/ToysGrid";
import { WorkVocabGrid } from "@/components/WorkVocabGrid";
import { DatesGrid } from "@/components/DatesGrid";
import { UsefulLinks } from "@/components/UsefulLinks";
import { LearningDecisionTree } from "@/components/LearningDecisionTree";

interface LessonProgress {
  id: number;
  title: string;
  progress: number;
  locked: boolean;
  completed: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const [activeSection, setActiveSection] = useState<"apprentissage" | "alphabet" | "chiffres" | "dictionnaire" | "quizz" | "traduction" | "stereotype" | "starterpack" | "liens">("apprentissage");
  const [starterPackView, setStarterPackView] = useState<"main" | "adulte" | "enfant">("main");
  const [activeStarterSection, setActiveStarterSection] = useState<string | null>(null);
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [ageGroup, setAgeGroup] = useState<"enfant" | "adulte">("adulte");
  const [level, setLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [newLessons, setNewLessons] = useState<any[]>([]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProgress(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
        fetchUserProgress(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserProgress = async (userId: string) => {
    // Fetch old lessons data for backward compatibility
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    const allLessons = [
      { id: 1, title: lessonsData["1"].title, progress: 0, locked: false, completed: false },
      { id: 2, title: lessonsData["2"].title, progress: 0, locked: false, completed: false },
      { id: 3, title: lessonsData["3"].title, progress: 0, locked: false, completed: false },
      { id: 4, title: lessonsData["4"].title, progress: 0, locked: false, completed: false },
      { id: 5, title: "Nourriture & Boissons", progress: 0, locked: true, completed: false },
      { id: 6, title: "Émotions", progress: 0, locked: true, completed: false },
    ];

    const lessonsWithProgress = allLessons.map(lesson => {
      const userProgress = progressData?.find(p => p.lesson_id === lesson.id.toString());
      if (userProgress) {
        const progress = Math.round((userProgress.score / userProgress.total_questions) * 100);
        return { ...lesson, progress, completed: userProgress.completed || progress === 100 };
      }
      return lesson;
    });

    setLessons(lessonsWithProgress);
    
    // Fetch new lessons structure
    await fetchNewLessons(userId);
  };

  const fetchNewLessons = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke('get-filtered-lessons', {
      body: { ageGroup, level, userId }
    });

    if (error) {
      console.error('Error fetching lessons:', error);
      return;
    }

    setNewLessons(data?.lessons || []);
  };

  useEffect(() => {
    if (user) {
      fetchNewLessons(user.id);
    }
  }, [ageGroup, level, user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success(t('dashboard.signedOut'));
      navigate("/auth");
    }
  };

  const handleTranslate = async () => {
    if (!textToTranslate.trim()) {
      toast.error("Veuillez entrer un texte à traduire");
      return;
    }

    setIsTranslating(true);
    setTranslation("");

    try {
      const { data, error } = await supabase.functions.invoke('translate-to-lsfb', {
        body: { text: textToTranslate }
      });

      if (error) throw error;

      if (data?.translation) {
        setTranslation(data.translation);
        toast.success("Traduction effectuée avec succès");
      } else {
        throw new Error("Aucune traduction reçue");
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Erreur lors de la traduction");
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Menu latéral */}
      <aside className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">Bienvenue {user?.email?.split('@')[0]}</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-6 px-2">MENU</h2>
          <div className="space-y-3">
            <Button
              onClick={() => setActiveSection("apprentissage")}
              variant={activeSection === "apprentissage" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Apprentissage
            </Button>
            <Button
              onClick={() => setActiveSection("alphabet")}
              variant={activeSection === "alphabet" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Alphabet
            </Button>
            <Button
              onClick={() => setActiveSection("chiffres")}
              variant={activeSection === "chiffres" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Chiffres
            </Button>
            <Button
              onClick={() => setActiveSection("dictionnaire")}
              variant={activeSection === "dictionnaire" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Dictionnaire
            </Button>
            <Button
              onClick={() => setActiveSection("quizz")}
              variant={activeSection === "quizz" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Quizz
            </Button>
            <Button
              onClick={() => setActiveSection("traduction")}
              variant={activeSection === "traduction" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Traduction
            </Button>
            <Button
              onClick={() => setActiveSection("stereotype")}
              variant={activeSection === "stereotype" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Stéréotype
            </Button>
            <Button
              onClick={() => setActiveSection("starterpack")}
              variant={activeSection === "starterpack" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Starter Pack
            </Button>
            <Button
              onClick={() => setActiveSection("liens")}
              variant={activeSection === "liens" ? "default" : "ghost"}
              className="w-full justify-start text-lg h-14"
            >
              Liens utiles
            </Button>
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-lg h-14"
            >
              <LogOut className="w-5 h-5 mr-2" />
              Quitter
            </Button>
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            App Langue des Signes
          </p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {activeSection === "apprentissage" && "Section Apprentissage"}
              {activeSection === "alphabet" && "Section Alphabet"}
              {activeSection === "chiffres" && "Section Chiffres"}
              {activeSection === "dictionnaire" && "Section Dictionnaire"}
              {activeSection === "quizz" && "Section Quizz"}
              {activeSection === "traduction" && "Section Traduction"}
              {activeSection === "stereotype" && "Section Stéréotype"}
              {activeSection === "starterpack" && "Section Starter Pack"}
              {activeSection === "liens" && "Liens Utiles"}
            </h2>
            <Link to="/stats">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('common.stats')}
              </Button>
            </Link>
          </div>
        </header>

        <div className="p-8">
          {activeSection === "apprentissage" && (
            <LearningDecisionTree />
          )}

          {activeSection === "alphabet" && (
            <div className="max-w-6xl">
              <AlphabetGrid />
            </div>
          )}

          {activeSection === "chiffres" && (
            <div className="max-w-6xl">
              <NumbersGrid />
            </div>
          )}

          {activeSection === "dictionnaire" && (
            <div className="max-w-6xl">
              <LSFBDictionary />
            </div>
          )}

          {activeSection === "quizz" && (
            <div className="max-w-4xl">
              <Card className="p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Section Quizz</h3>
                <p className="text-muted-foreground mb-6">
                  Testez vos connaissances de la langue des signes franco-belge avec nos quizz interactifs.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {lessons.filter(l => !l.locked).map((lesson) => (
                    <Link key={lesson.id} to={`/lesson/${lesson.id}`}>
                      <Card className="p-6 hover:shadow-candy transition-shadow cursor-pointer border-2">
                        <h4 className="font-bold mb-2">{lesson.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {lesson.completed ? "Refaire le quizz" : "Commencer le quizz"}
                        </p>
                      </Card>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>
          )}

          {activeSection === "traduction" && (
            <div className="max-w-6xl">
              <SentenceTranslator />
            </div>
          )}

          {activeSection === "stereotype" && (
            <div className="max-w-4xl">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4">Section Stéréotype</h3>
                <p className="text-muted-foreground mb-6">
                  Découvrez et explorez les stéréotypes liés à la langue des signes.
                </p>
              </Card>
            </div>
          )}

          {activeSection === "starterpack" && (
            <div className="max-w-6xl">
              {starterPackView === "main" && (
                <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow mb-8">
                  <h3 className="text-3xl font-bold mb-6 text-center gradient-text">
                    Vous souhaitez communiquer avec
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Section Adulte */}
                    <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 backdrop-blur-sm border-2 hover:shadow-candy transition-all duration-300 cursor-pointer">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-full gradient-candy flex items-center justify-center">
                          <span className="text-5xl">👨‍💼</span>
                        </div>
                        <h4 className="text-2xl font-bold">Adulte</h4>
                        <p className="text-muted-foreground">
                          Apprenez les signes essentiels pour communiquer avec des adultes sourds ou malentendants
                        </p>
                        <Button 
                          className="w-full gradient-candy mt-4"
                          onClick={() => setStarterPackView("adulte")}
                        >
                          Commencer
                        </Button>
                      </div>
                    </Card>

                    {/* Section Enfant */}
                    <Card className="p-8 bg-gradient-to-br from-accent/5 to-success/5 backdrop-blur-sm border-2 hover:shadow-candy transition-all duration-300 cursor-pointer">
                      <div className="text-center space-y-4">
                        <div className="w-24 h-24 mx-auto rounded-full gradient-accent flex items-center justify-center">
                          <span className="text-5xl">👶</span>
                        </div>
                        <h4 className="text-2xl font-bold">Enfant</h4>
                        <p className="text-muted-foreground">
                          Découvrez les signes adaptés pour communiquer avec des enfants sourds ou malentendants
                        </p>
                        <Button 
                          className="w-full gradient-accent mt-4"
                          onClick={() => setStarterPackView("enfant")}
                        >
                          Commencer
                        </Button>
                      </div>
                    </Card>
                  </div>
                </Card>
              )}

              {starterPackView === "adulte" && (
                <div>
                  <Button 
                    variant="ghost" 
                    className="mb-6"
                    onClick={() => {
                      if (activeStarterSection) {
                        setActiveStarterSection(null);
                      } else {
                        setStarterPackView("main");
                      }
                    }}
                  >
                    ← Retour
                  </Button>
                  
                  {activeStarterSection === "alphabet" && <AlphabetGrid />}
                  {activeStarterSection === "greetings" && <GreetingsGrid />}
                  {activeStarterSection === "numbers" && <NumbersGrid />}
                  {activeStarterSection === "work" && <WorkVocabGrid />}
                  {activeStarterSection === "dates" && <DatesGrid />}
                  
                  {!activeStarterSection && (
                    <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow mb-8">
                      <h3 className="text-3xl font-bold mb-2 gradient-text text-center">Ressources LSFB pour Adultes</h3>
                      <p className="text-muted-foreground mb-8 text-center">
                        Découvrez les signes essentiels pour communiquer dans un contexte professionnel et quotidien
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card 
                          className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("alphabet")}
                        >
                          <img src={lsfbAlphabet} alt="Alphabet LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Alphabet</h4>
                          <p className="text-sm text-muted-foreground mb-4">Maîtrisez l'alphabet pour épeler noms et mots techniques</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("greetings")}
                        >
                          <img src={lsfbGreetings} alt="Salutations LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Salutations professionnelles</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les formules de politesse pour le travail</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("numbers")}
                        >
                          <img src={lsfbNumbers} alt="Chiffres LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Chiffres et nombres</h4>
                          <p className="text-sm text-muted-foreground mb-4">Essentiels pour dates, prix et quantités</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("work")}
                        >
                          <div className="w-full h-48 bg-gradient-candy rounded-lg mb-4 flex items-center justify-center text-6xl">🏢</div>
                          <h4 className="text-xl font-bold mb-2">Vocabulaire professionnel</h4>
                          <p className="text-sm text-muted-foreground mb-4">Métiers, entreprise, réunions</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("dates")}
                        >
                          <div className="w-full h-48 bg-gradient-accent rounded-lg mb-4 flex items-center justify-center text-6xl">🕐</div>
                          <h4 className="text-xl font-bold mb-2">Temps et dates</h4>
                          <p className="text-sm text-muted-foreground mb-4">Heures, jours, mois, années</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all opacity-50">
                          <div className="w-full h-48 bg-gradient-success rounded-lg mb-4 flex items-center justify-center text-6xl">🏥</div>
                          <h4 className="text-xl font-bold mb-2">Situations d'urgence</h4>
                          <p className="text-sm text-muted-foreground mb-4">Santé, sécurité, aide</p>
                          <div className="text-sm text-muted-foreground font-medium">À venir</div>
                        </Card>
                      </div>
                    </Card>
                  )}
                </div>
              )}

              {starterPackView === "enfant" && (
                <div>
                  <Button 
                    variant="ghost" 
                    className="mb-6"
                    onClick={() => {
                      if (activeStarterSection) {
                        setActiveStarterSection(null);
                      } else {
                        setStarterPackView("main");
                      }
                    }}
                  >
                    ← Retour
                  </Button>
                  
                  {activeStarterSection === "alphabet" && <AlphabetGrid />}
                  {activeStarterSection === "numbers" && <NumbersGrid />}
                  {activeStarterSection === "greetings" && <GreetingsGrid />}
                  {activeStarterSection === "colors" && <ColorsGrid />}
                  {activeStarterSection === "animals" && <AnimalsGrid />}
                  {activeStarterSection === "emotions" && <EmotionsGrid />}
                  {activeStarterSection === "family" && <FamilyGrid />}
                  {activeStarterSection === "food" && <FoodGrid />}
                  {activeStarterSection === "toys" && <ToysGrid />}
                  
                  {!activeStarterSection && (
                    <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow mb-8">
                      <h3 className="text-3xl font-bold mb-2 gradient-text text-center">Ressources LSFB pour Enfants</h3>
                      <p className="text-muted-foreground mb-8 text-center">
                        Découvrez les signes ludiques et essentiels pour communiquer avec les enfants
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("alphabet")}
                        >
                          <img src={lsfbAlphabet} alt="Alphabet LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Alphabet ludique</h4>
                          <p className="text-sm text-muted-foreground mb-4">Apprendre l'alphabet en s'amusant</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("numbers")}
                        >
                          <img src={lsfbNumbers} alt="Chiffres LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Compter avec les mains</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les chiffres de 1 à 10 et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("greetings")}
                        >
                          <img src={lsfbGreetings} alt="Salutations LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Bonjour et au revoir</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les premières salutations</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("colors")}
                        >
                          <div className="w-full h-48 bg-gradient-candy rounded-lg mb-4 flex items-center justify-center text-6xl">🎨</div>
                          <h4 className="text-xl font-bold mb-2">Couleurs</h4>
                          <p className="text-sm text-muted-foreground mb-4">Rouge, bleu, jaune et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("animals")}
                        >
                          <div className="w-full h-48 bg-gradient-accent rounded-lg mb-4 flex items-center justify-center text-6xl">🐶</div>
                          <h4 className="text-xl font-bold mb-2">Animaux</h4>
                          <p className="text-sm text-muted-foreground mb-4">Chat, chien, lapin et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("emotions")}
                        >
                          <div className="w-full h-48 bg-gradient-success rounded-lg mb-4 flex items-center justify-center text-6xl">😊</div>
                          <h4 className="text-xl font-bold mb-2">Émotions</h4>
                          <p className="text-sm text-muted-foreground mb-4">Content, triste, en colère</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("family")}
                        >
                          <div className="w-full h-48 bg-gradient-candy rounded-lg mb-4 flex items-center justify-center text-6xl">👨‍👩‍👧‍👦</div>
                          <h4 className="text-xl font-bold mb-2">Famille</h4>
                          <p className="text-sm text-muted-foreground mb-4">Papa, maman, frère, sœur</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("food")}
                        >
                          <div className="w-full h-48 bg-gradient-accent rounded-lg mb-4 flex items-center justify-center text-6xl">🍎</div>
                          <h4 className="text-xl font-bold mb-2">Nourriture</h4>
                          <p className="text-sm text-muted-foreground mb-4">Fruits, légumes, repas</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card 
                          className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer"
                          onClick={() => setActiveStarterSection("toys")}
                        >
                          <div className="w-full h-48 bg-gradient-success rounded-lg mb-4 flex items-center justify-center text-6xl">🎮</div>
                          <h4 className="text-xl font-bold mb-2">Jeux et jouets</h4>
                          <p className="text-sm text-muted-foreground mb-4">Ballon, poupée, jeux</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>
                      </div>
                    </Card>
                  )}
                </div>
              )}
            </div>
          )}

          {activeSection === "liens" && (
            <UsefulLinks />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
