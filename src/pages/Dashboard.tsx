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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="bg-card/50 backdrop-blur-sm border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold gradient-candy bg-clip-text text-transparent">
              {t('app.name')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/stats">
              <Button variant="outline" size="sm" className="gap-2">
                <BarChart3 className="w-4 h-4" />
                {t('common.stats')}
              </Button>
            </Link>
            <Button variant="outline" size="sm" className="gap-2" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              {t('common.logout')}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="p-6 shadow-candy mb-8 border-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold mb-1">{t('dashboard.welcome', { name: user?.email?.split('@')[0] })}</h2>
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

        <div className="space-y-4">
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
      </main>
    </div>
  );
};

export default Dashboard;
