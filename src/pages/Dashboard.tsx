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
  const [activeSection, setActiveSection] = useState<"apprentissage" | "quizz" | "traduction" | "stereotype">("apprentissage");
  const [textToTranslate, setTextToTranslate] = useState("");
  const [translation, setTranslation] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

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
  };

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
              {activeSection === "quizz" && "Section Quizz"}
              {activeSection === "traduction" && "Section Traduction"}
              {activeSection === "stereotype" && "Section Stéréotype"}
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
            <>
              <Card className="p-6 shadow-candy mb-8 border-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{t('dashboard.welcome', { name: user?.email?.split('@')[0] })}</h3>
                    <p className="text-muted-foreground">{t('dashboard.keepStreak')}</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full gradient-candy flex items-center justify-center mb-1">
                        <Trophy className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">7 {t('dashboard.dayStreak')}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center mb-1">
                        <Target className="w-6 h-6 text-accent-foreground" />
                      </div>
                      <p className="text-xs text-muted-foreground">420 XP</p>
                    </div>
                  </div>
                </div>
              </Card>

              <h3 className="text-2xl font-bold mb-6">{t('dashboard.learningPath')}</h3>

              <div className="space-y-4 max-w-4xl">
                {lessons.map((lesson, index) => (
                  <Card
                    key={lesson.id}
                    className={`p-6 transition-all duration-300 hover:scale-[1.02] border-2 ${
                      lesson.locked
                        ? "opacity-60 cursor-not-allowed"
                        : "shadow-candy hover:shadow-glow cursor-pointer"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl font-bold ${
                          lesson.locked
                            ? "bg-muted text-muted-foreground"
                            : lesson.completed
                            ? "gradient-success text-success-foreground"
                            : lesson.progress > 0
                            ? "gradient-accent text-accent-foreground"
                            : "gradient-candy text-primary-foreground"
                        }`}
                      >
                        {lesson.locked ? t('dashboard.locked') : lesson.completed ? "✓" : index + 1}
                      </div>

                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">{lesson.title}</h4>
                        <div className="flex items-center gap-3">
                          <Progress value={lesson.progress} className="flex-1" />
                          <span className="text-sm text-muted-foreground min-w-[3rem]">
                            {lesson.progress}%
                          </span>
                        </div>
                      </div>

                      {!lesson.locked && (
                        <Link to={`/lesson/${lesson.id}`}>
                          <Button
                            className={`${
                              lesson.completed
                                ? "gradient-success"
                                : lesson.progress > 0
                                ? "gradient-accent"
                                : "gradient-candy"
                            }`}
                          >
                            {lesson.completed ? t('dashboard.review') : lesson.progress > 0 ? t('dashboard.continue') : t('dashboard.start')}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
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
            <div className="max-w-4xl">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-4">Section Traduction</h3>
                <p className="text-muted-foreground mb-6">
                  Traduisez du français vers la langue des signes franco-belge et vice versa.
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Texte à traduire</label>
                    <textarea 
                      className="w-full p-3 border border-border rounded-md bg-background min-h-[120px]"
                      placeholder="Entrez votre texte ici..."
                      value={textToTranslate}
                      onChange={(e) => setTextToTranslate(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="gradient-candy" 
                    onClick={handleTranslate}
                    disabled={isTranslating || !textToTranslate.trim()}
                  >
                    {isTranslating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Traduction en cours...
                      </>
                    ) : (
                      "Traduire"
                    )}
                  </Button>
                  {translation && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <h4 className="font-semibold mb-4">Description des signes LSFB :</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <ReactMarkdown>{translation}</ReactMarkdown>
                      </div>
                    </div>
                  )}
                  {!translation && !isTranslating && (
                    <div className="mt-6 p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">
                        La traduction apparaîtra ici...
                      </p>
                    </div>
                  )}
                </div>
              </Card>
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
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
