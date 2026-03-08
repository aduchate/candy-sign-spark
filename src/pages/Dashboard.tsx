import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { Link, useNavigate, useSearchParams } from "react-router-dom";
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
import { MedicalGlossary } from "@/components/MedicalGlossary";
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
import { EmergencyGrid } from "@/components/EmergencyGrid";
import { UsefulLinks } from "@/components/UsefulLinks";
import { LearningDecisionTree } from "@/components/LearningDecisionTree";
import { StereotypeQuiz } from "@/components/StereotypeQuiz";
import { AppointmentBookingSection } from "@/components/AppointmentBookingSection";
import { HospitalPlansSection } from "@/components/HospitalPlansSection";
import { UtilitairesSection } from "@/components/UtilitairesSection";
import { DonationSection } from "@/components/DonationSection";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { offlineCache, CACHE_KEYS } from "@/lib/offlineCache";
import { offlineSync } from "@/lib/offlineSync";

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
  const isOnline = useOnlineStatus();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [lessons, setLessons] = useState<LessonProgress[]>([]);
  const sectionParam = searchParams.get("section") as
    | "apprentissage"
    | "glossaire"
    | "quizz"
    | "traduction"
    | "starterpack"
    | "liens"
    | null;
  const [activeSection, setActiveSection] = useState<
    "apprentissage" | "glossaire" | "quizz" | "traduction" | "starterpack" | "liens" | "utilitaires" | "dons" | "rendezvous" | "hopitaux" | "actualites" | "emploi" | "administration" | "projets" | "formations" | "evenements"
  >(sectionParam || "apprentissage");
  const [notionOpen, setNotionOpen] = useState(true);
  const [medicalOpen, setMedicalOpen] = useState(false);
  const [utilitairesOpen, setUtilitairesOpen] = useState(false);
  const [showStereotypeQuiz, setShowStereotypeQuiz] = useState(false);
  const [starterPackView, setStarterPackView] = useState<"main" | "adulte" | "enfant">("main");
  const [activeStarterSection, setActiveStarterSection] = useState<string | null>(null);
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [ageGroup, setAgeGroup] = useState<"enfant" | "adulte">("adulte");
  const [level, setLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [newLessons, setNewLessons] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        if (!isOnline) {
          // Allow offline access without authentication
          setIsOfflineMode(true);
          loadCachedData();
          setLoading(false);
        } else {
          navigate("/auth");
        }
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", session.user.id)
          .single();

        if (!profile?.onboarding_completed) {
          navigate("/onboarding");
          return;
        }

        setUser(session.user);
        fetchUserProgress(session.user.id);
        checkAdminStatus(session.user.id);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        if (!isOnline) {
          setIsOfflineMode(true);
        } else {
          navigate("/auth");
        }
      } else {
        setUser(session.user);
        setIsOfflineMode(false);
        fetchUserProgress(session.user.id);
        checkAdminStatus(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, isOnline]);

  const loadCachedData = () => {
    const cachedLessons = offlineCache.get<LessonProgress[]>(CACHE_KEYS.LESSONS);
    if (cachedLessons) setLessons(cachedLessons);

    const cachedQuizzes = offlineCache.get<any[]>(CACHE_KEYS.QUIZZES);
    if (cachedQuizzes) setQuizzes(cachedQuizzes);

    const cachedNewLessons = offlineCache.get<any[]>('new_lessons');
    if (cachedNewLessons) setNewLessons(cachedNewLessons);
  };

  const checkAdminStatus = async (userId: string) => {
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", userId);
    const hasAdminRole = roles?.some((r) => r.role === "admin");
    setIsAdmin(hasAdminRole || false);
  };

  const fetchUserProgress = async (userId: string) => {
    const { data: progressData } = await supabase.from("user_progress").select("*").eq("user_id", userId);

    // Cache progress for offline use
    if (progressData) {
      offlineCache.set(CACHE_KEYS.USER_PROGRESS, progressData);
    }

    const allLessons = [
      { id: 1, title: lessonsData["1"].title, progress: 0, locked: false, completed: false },
      { id: 2, title: lessonsData["2"].title, progress: 0, locked: false, completed: false },
      { id: 3, title: lessonsData["3"].title, progress: 0, locked: false, completed: false },
      { id: 4, title: lessonsData["4"].title, progress: 0, locked: false, completed: false },
      { id: 5, title: "Nourriture & Boissons", progress: 0, locked: true, completed: false },
      { id: 6, title: "Émotions", progress: 0, locked: true, completed: false },
    ];

    const lessonsWithProgress = allLessons.map((lesson) => {
      const userProgress = progressData?.find((p) => p.lesson_id === lesson.id.toString());
      if (userProgress) {
        const progress = Math.round((userProgress.score / userProgress.total_questions) * 100);
        return { ...lesson, progress, completed: userProgress.completed || progress === 100 };
      }
      return lesson;
    });

    setLessons(lessonsWithProgress);
    offlineCache.set(CACHE_KEYS.LESSONS, lessonsWithProgress);

    await fetchNewLessons(userId);
  };

  const fetchNewLessons = async (userId: string) => {
    const { data, error } = await supabase.functions.invoke("get-filtered-lessons", {
      body: { ageGroup, level, userId },
    });

    if (error) {
      console.error("Error fetching lessons:", error);
      // Fall back to cache
      const cached = offlineCache.get<any[]>('new_lessons');
      if (cached) setNewLessons(cached);
      return;
    }

    const lessons = data?.lessons || [];
    setNewLessons(lessons);
    offlineCache.set('new_lessons', lessons);
  };

  const fetchQuizzes = async () => {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("is_quiz", true)
      .order("order_index", { ascending: true });

    if (error) {
      console.error("Error fetching quizzes:", error);
      const cached = offlineCache.get<any[]>(CACHE_KEYS.QUIZZES);
      if (cached) setQuizzes(cached);
      return;
    }

    setQuizzes(data || []);
    offlineCache.set(CACHE_KEYS.QUIZZES, data || []);
  };

  useEffect(() => {
    if (user) {
      fetchNewLessons(user.id);
      fetchQuizzes();
    } else if (isOfflineMode) {
      loadCachedData();
    }
  }, [ageGroup, level, user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      toast.success(t("dashboard.signedOut"));
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
      const { data, error } = await supabase.functions.invoke("translate-to-lsfb", {
        body: { text: textToTranslate },
      });

      if (error) throw error;

      if (data?.translation) {
        setTranslation(data.translation);
        toast.success("Traduction effectuée avec succès");
      } else {
        throw new Error("Aucune traduction reçue");
      }
    } catch (error) {
      console.error("Translation error:", error);
      toast.error("Erreur lors de la traduction");
    } finally {
      setIsTranslating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-muted-foreground">Chargement...</span>
      </div>
    );
  }

  const displayName = user?.email?.split("@")[0] || "Utilisateur";

  return (
    <div className="min-h-screen flex bg-background">
      {/* Menu latéral */}
      <aside className="w-80 bg-card border-r border-border flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="mb-2">
            <h1 className="text-xl font-bold">
              {isOfflineMode ? "Mode hors ligne" : `Bienvenue ${displayName}`}
            </h1>
          </div>
          {isOfflineMode && (
            <p className="text-xs text-muted-foreground">
              Modules d'apprentissage disponibles
            </p>
          )}
        </div>

        <nav className="flex-1 p-4">
          <h2 className="text-2xl font-bold mb-6 px-2">MENU</h2>
          <div className="space-y-3">
            <div>
              <Button
                onClick={() => setNotionOpen(!notionOpen)}
                variant={["apprentissage", "glossaire", "starterpack"].includes(activeSection) ? "default" : "ghost"}
                className="w-full justify-start text-lg h-14"
              >
                Pro de santé {notionOpen ? "▾" : "▸"}
              </Button>
              {notionOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Button
                    onClick={() => setActiveSection("apprentissage")}
                    variant={activeSection === "apprentissage" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Apprentissage
                  </Button>
                  <Button
                    onClick={() => setActiveSection("glossaire")}
                    variant={activeSection === "glossaire" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Glossaire
                  </Button>
                  <Button
                    onClick={() => setActiveSection("starterpack")}
                    variant={activeSection === "starterpack" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Starter Pack
                  </Button>
                </div>
              )}
            </div>
            <div>
              <Button
                onClick={() => setMedicalOpen(!medicalOpen)}
                variant={["rendezvous", "hopitaux", "dons", "liens", "utilitaires"].includes(activeSection) ? "default" : "ghost"}
                className="w-full justify-start text-lg h-14"
              >
                Patient signant {medicalOpen ? "▾" : "▸"}
              </Button>
              {medicalOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  <Button
                    onClick={() => setActiveSection("rendezvous")}
                    variant={activeSection === "rendezvous" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Prise de rendez-vous
                  </Button>
                  <Button
                    onClick={() => setActiveSection("hopitaux")}
                    variant={activeSection === "hopitaux" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Plans hôpitaux
                  </Button>
                  <Button
                    onClick={() => setActiveSection("dons")}
                    variant={activeSection === "dons" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Dons pour votre cause
                  </Button>
                  <Button
                    onClick={() => setActiveSection("liens")}
                    variant={activeSection === "liens" ? "secondary" : "ghost"}
                    className="w-full justify-start text-base h-12"
                  >
                    Liens utiles
                  </Button>
                  <div>
                    <Button
                      onClick={() => setUtilitairesOpen(!utilitairesOpen)}
                      variant={["actualites", "emploi", "administration", "projets", "formations", "evenements"].includes(activeSection) ? "secondary" : "ghost"}
                      className="w-full justify-start text-base h-12"
                    >
                      Utilitaires {utilitairesOpen ? "▾" : "▸"}
                    </Button>
                    {utilitairesOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Button onClick={() => setActiveSection("actualites")} variant={activeSection === "actualites" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Actualités</Button>
                        <Button onClick={() => setActiveSection("emploi")} variant={activeSection === "emploi" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Aide à l'Emploi</Button>
                        <Button onClick={() => setActiveSection("administration")} variant={activeSection === "administration" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Administration</Button>
                        <Button onClick={() => setActiveSection("projets")} variant={activeSection === "projets" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Projets</Button>
                        <Button onClick={() => setActiveSection("formations")} variant={activeSection === "formations" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Formations</Button>
                        <Button onClick={() => setActiveSection("evenements")} variant={activeSection === "evenements" ? "secondary" : "ghost"} className="w-full justify-start text-sm h-10">Événements</Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {isAdmin && (
              <Link to="/admin" className="w-full">
                <Button variant="ghost" className="w-full justify-start text-lg h-14">
                   Administration
                 </Button>
              </Link>
            )}
            {isOfflineMode ? (
              <Button onClick={() => navigate("/auth")} variant="ghost" className="w-full justify-start text-lg h-14">
                Se connecter
              </Button>
            ) : (
              <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-lg h-14">
                Quitter
              </Button>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">App Langue des Signes</p>
        </div>
      </aside>

      {/* Contenu principal */}
      <main className="flex-1 overflow-auto">
        <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {activeSection === "apprentissage" && "Section Apprentissage"}
              {activeSection === "glossaire" && "Glossaire Paramédical"}
              {activeSection === "quizz" && "Section Quizz"}
              {activeSection === "traduction" && "Section Traduction"}
              {activeSection === "starterpack" && "Section Starter Pack"}
              {activeSection === "liens" && "Liens Utiles"}
              {activeSection === "utilitaires" && "Utilitaires"}
              {activeSection === "actualites" && "Actualités"}
              {activeSection === "emploi" && "Aide à l'Emploi"}
              {activeSection === "administration" && "Administration"}
              {activeSection === "projets" && "Projets"}
              {activeSection === "formations" && "Formations"}
              {activeSection === "evenements" && "Événements"}
              {activeSection === "rendezvous" && "Prise de rendez-vous"}
              {activeSection === "hopitaux" && "Plans hôpitaux"}
              {activeSection === "dons" && "Dons pour votre cause"}
            </h2>
            {!isOfflineMode && (
              <Link to="/stats">
                <Button variant="outline" size="sm">
                  {t("common.stats")}
                </Button>
              </Link>
            )}
          </div>
        </header>

        <div className="p-8">
          {activeSection === "apprentissage" && <LearningDecisionTree />}

          {activeSection === "glossaire" && (
            <div className="max-w-6xl">
              <MedicalGlossary />
            </div>
          )}

          {activeSection === "quizz" && (
            <div className="max-w-4xl">
              {showStereotypeQuiz ? (
                <div>
                  <Button variant="ghost" className="mb-6" onClick={() => setShowStereotypeQuiz(false)}>
                    ← Retour aux quizz
                  </Button>
                  <StereotypeQuiz />
                </div>
              ) : (
                <Card className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Section Quizz</h3>
                  <p className="text-muted-foreground mb-6">
                    Testez vos connaissances de la langue des signes franco-belge avec nos quizz interactifs.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {quizzes.map((quiz) => (
                      <Link key={quiz.id} to={`/lesson/${quiz.id}`}>
                        <Card className="p-6 hover:shadow-candy transition-shadow cursor-pointer border-2">
                          <h4 className="font-bold mb-2">{quiz.title}</h4>
                          {quiz.description && <p className="text-sm text-muted-foreground/60 mb-2">{quiz.description}</p>}
                          <Button variant="outline" className="w-full mt-4">
                            Commencer le quizz
                          </Button>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          )}

          {activeSection === "traduction" && (
            <div className="max-w-6xl">
              {isOfflineMode ? (
                <Card className="p-8 text-center">
                  <h3 className="text-xl font-semibold mb-2">Traduction indisponible hors ligne</h3>
                  <p className="text-muted-foreground">
                    La traduction nécessite une connexion internet. Reconnectez-vous pour utiliser cette fonctionnalité.
                  </p>
                </Card>
              ) : (
                <SentenceTranslator />
              )}
            </div>
          )}

          {activeSection === "starterpack" && (
            <div className="max-w-6xl">
              {starterPackView === "main" && (
                <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow mb-8">
                  <h3 className="text-3xl font-bold mb-6 text-center gradient-text">Vous souhaitez communiquer avec</h3>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Card className="p-8 border-2 hover:shadow-lg transition-all duration-300 cursor-pointer">
                       <div className="text-center space-y-4">
                         <h4 className="text-2xl font-bold">Adulte</h4>
                        <p className="text-muted-foreground">
                          Apprenez les signes essentiels pour communiquer avec des adultes sourds ou malentendants
                        </p>
                        <Button className="w-full gradient-candy mt-4" onClick={() => setStarterPackView("adulte")}>
                          Commencer
                        </Button>
                      </div>
                    </Card>

                     <Card className="p-8 border-2 hover:shadow-lg transition-all duration-300 cursor-pointer">
                       <div className="text-center space-y-4">
                         <h4 className="text-2xl font-bold">Enfant</h4>
                         <p className="text-muted-foreground">
                           Découvrez les signes adaptés pour communiquer avec des enfants sourds ou malentendants
                         </p>
                         <Button className="w-full mt-4" onClick={() => setStarterPackView("enfant")}>
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
                  {activeStarterSection === "emergency" && <EmergencyGrid />}

                  {!activeStarterSection && (
                    <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow mb-8">
                      <h3 className="text-3xl font-bold mb-2 gradient-text text-center">
                        Ressources LSFB pour Adultes
                      </h3>
                      <p className="text-muted-foreground mb-8 text-center">
                        Découvrez les signes essentiels pour communiquer dans un contexte professionnel et quotidien
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("alphabet")}>
                          <img src={lsfbAlphabet} alt="Alphabet LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Alphabet</h4>
                          <p className="text-sm text-muted-foreground mb-4">Maîtrisez l'alphabet pour épeler noms et mots techniques</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("greetings")}>
                          <img src={lsfbGreetings} alt="Salutations LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Salutations professionnelles</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les formules de politesse pour le travail</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("numbers")}>
                          <img src={lsfbNumbers} alt="Chiffres LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Chiffres et nombres</h4>
                          <p className="text-sm text-muted-foreground mb-4">Essentiels pour dates, prix et quantités</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("work")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Vocabulaire professionnel</h4>
                          <p className="text-sm text-muted-foreground mb-4">Métiers, entreprise, réunions</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("dates")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Temps et dates</h4>
                          <p className="text-sm text-muted-foreground mb-4">Heures, jours, mois, années</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("emergency")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Situations d&apos;urgence</h4>
                          <p className="text-sm text-muted-foreground mb-4">Santé, sécurité, aide</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
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
                      <h3 className="text-3xl font-bold mb-2 gradient-text text-center">
                        Ressources LSFB pour Enfants
                      </h3>
                      <p className="text-muted-foreground mb-8 text-center">
                        Découvrez les signes ludiques et essentiels pour communiquer avec les enfants
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("alphabet")}>
                          <img src={lsfbAlphabet} alt="Alphabet LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Alphabet ludique</h4>
                          <p className="text-sm text-muted-foreground mb-4">Apprendre l'alphabet en s'amusant</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("numbers")}>
                          <img src={lsfbNumbers} alt="Chiffres LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Compter avec les mains</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les chiffres de 1 à 10 et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("greetings")}>
                          <img src={lsfbGreetings} alt="Salutations LSFB" className="w-full h-48 object-cover rounded-lg mb-4" />
                          <h4 className="text-xl font-bold mb-2">Bonjour et au revoir</h4>
                          <p className="text-sm text-muted-foreground mb-4">Les premières salutations</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("colors")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Couleurs</h4>
                          <p className="text-sm text-muted-foreground mb-4">Rouge, bleu, jaune et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("animals")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Animaux</h4>
                          <p className="text-sm text-muted-foreground mb-4">Chat, chien, lapin et plus</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("emotions")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Émotions</h4>
                          <p className="text-sm text-muted-foreground mb-4">Content, triste, en colère</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("family")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Famille</h4>
                          <p className="text-sm text-muted-foreground mb-4">Papa, maman, frère, sœur</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("food")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
                          <h4 className="text-xl font-bold mb-2">Nourriture</h4>
                          <p className="text-sm text-muted-foreground mb-4">Fruits, légumes, repas</p>
                          <div className="text-sm text-green-600 font-medium">✓ Disponible</div>
                        </Card>

                        <Card className="p-6 bg-gradient-to-br from-accent/10 to-success/10 backdrop-blur-sm border-2 hover:shadow-candy transition-all cursor-pointer" onClick={() => setActiveStarterSection("toys")}>
                          <div className="w-full h-48 bg-muted rounded-lg mb-4"></div>
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

          {activeSection === "liens" && <UsefulLinks />}

          {activeSection === "utilitaires" && <UtilitairesSection />}

          {activeSection === "rendezvous" && <AppointmentBookingSection />}

          {activeSection === "hopitaux" && <HospitalPlansSection />}

          {activeSection === "dons" && (
            <div className="max-w-4xl">
              <Card className="p-8 mb-8">
                <div className="text-center max-w-3xl mx-auto">
                  <h2 className="text-3xl font-bold mb-4">
                    Soutenez les ASBL qui œuvrent pour la communauté sourde
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Votre générosité permet aux associations de continuer leur mission d'inclusion
                    et d'accompagnement des personnes sourdes et malentendantes.
                  </p>
                </div>
              </Card>
              <DonationSection
                organization="SAREW"
                icon="❤️"
                description="Soutenez SAREW dans sa mission d'inclusion et d'accessibilité pour les personnes sourdes"
              />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
