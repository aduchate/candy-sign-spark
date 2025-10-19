import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Trophy, Target, Flame, Star, TrendingUp, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Stats = () => {
  const navigate = useNavigate();

  const stats = {
    totalXP: 420,
    currentStreak: 7,
    longestStreak: 12,
    lessonsCompleted: 3,
    accuracy: 87,
    badges: [
      { name: "First Lesson", icon: "🎯", unlocked: true },
      { name: "Week Warrior", icon: "⚡", unlocked: true },
      { name: "Quick Learner", icon: "🚀", unlocked: true },
      { name: "Perfect Score", icon: "💯", unlocked: false },
      { name: "Month Master", icon: "🏆", unlocked: false },
      { name: "Sign Expert", icon: "👑", unlocked: false },
    ],
  };

  const weeklyProgress = [
    { day: "Mon", xp: 50 },
    { day: "Tue", xp: 75 },
    { day: "Wed", xp: 60 },
    { day: "Thu", xp: 90 },
    { day: "Fri", xp: 55 },
    { day: "Sat", xp: 45 },
    { day: "Sun", xp: 45 },
  ];

  const maxXP = Math.max(...weeklyProgress.map(d => d.xp));

  return (
    <div className="min-h-screen p-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="gap-2 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-8 gradient-candy bg-clip-text text-transparent">
          Your Progress
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 shadow-candy border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-candy flex items-center justify-center">
                <Target className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalXP}</p>
                <p className="text-sm text-muted-foreground">Total XP</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-candy border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center">
                <Flame className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-candy border-2">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full gradient-success flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.accuracy}%</p>
                <p className="text-sm text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6 shadow-candy border-2 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Star className="w-5 h-5 text-primary" />
            Weekly Activity
          </h2>
          <div className="flex items-end justify-between gap-2 h-40">
            {weeklyProgress.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2 flex-1">
                <div className="w-full relative">
                  <div
                    className="w-full gradient-accent rounded-t-lg transition-all duration-500 hover:shadow-glow"
                    style={{ height: `${(day.xp / maxXP) * 120}px`, minHeight: "20px" }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">{day.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-candy border-2 mb-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Achievements
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stats.badges.map((badge, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  badge.unlocked
                    ? "gradient-candy border-primary shadow-candy"
                    : "bg-muted/50 border-muted opacity-50"
                }`}
              >
                <div className="text-4xl mb-2">{badge.icon}</div>
                <p className="text-sm font-semibold">{badge.name}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 shadow-candy border-2">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Personal Bests
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Longest Streak</span>
              <span className="font-bold">{stats.longestStreak} days</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lessons Completed</span>
              <span className="font-bold">{stats.lessonsCompleted}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Best Accuracy</span>
              <span className="font-bold">95%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Stats;
