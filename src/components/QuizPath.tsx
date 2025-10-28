import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Star, Lock, Play, CheckCircle2, Trophy, Headphones, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface LessonNode {
  id: number;
  title: string;
  progress: number;
  isLocked: boolean;
  isCompleted: boolean;
  type: "practice" | "exercise" | "star" | "audio" | "video";
}

interface QuizPathProps {
  lessons: LessonNode[];
}

export const QuizPath = ({ lessons }: QuizPathProps) => {
  const navigate = useNavigate();

  const getNodeIcon = (lesson: LessonNode) => {
    if (lesson.isLocked) return <Lock className="w-6 h-6" />;
    if (lesson.isCompleted) return <CheckCircle2 className="w-6 h-6" />;
    
    switch (lesson.type) {
      case "star":
        return <Star className="w-6 h-6" />;
      case "audio":
        return <Headphones className="w-6 h-6" />;
      case "video":
        return <Video className="w-6 h-6" />;
      case "exercise":
        return <Trophy className="w-6 h-6" />;
      default:
        return <Play className="w-6 h-6" />;
    }
  };

  const getNodeColor = (lesson: LessonNode) => {
    if (lesson.isLocked) return "bg-muted text-muted-foreground";
    if (lesson.isCompleted) return "bg-success text-success-foreground";
    if (lesson.type === "star") return "gradient-candy text-white";
    if (lesson.progress > 0) return "bg-secondary text-secondary-foreground";
    return "bg-primary text-primary-foreground";
  };

  const handleNodeClick = (lesson: LessonNode) => {
    if (!lesson.isLocked) {
      navigate(`/lesson/${lesson.id}`);
    }
  };

  // Organize lessons into a winding path (zigzag pattern)
  const renderPath = () => {
    const rows: JSX.Element[] = [];
    let currentRow: JSX.Element[] = [];
    const itemsPerRow = 3;

    lessons.forEach((lesson, index) => {
      const rowIndex = Math.floor(index / itemsPerRow);
      const isEvenRow = rowIndex % 2 === 0;
      const positionInRow = index % itemsPerRow;

      // Determine horizontal position
      const leftOffset = isEvenRow 
        ? positionInRow * 33.33 
        : (itemsPerRow - 1 - positionInRow) * 33.33;

      const node = (
        <div
          key={lesson.id}
          className="absolute transition-all duration-300"
          style={{
            left: `${leftOffset}%`,
            top: `${rowIndex * 160}px`,
          }}
        >
          {/* Connecting line to next node */}
          {index < lessons.length - 1 && (
            <div
              className={cn(
                "absolute top-1/2 h-1 rounded",
                lesson.isCompleted ? "bg-success" : "bg-border"
              )}
              style={{
                left: isEvenRow ? "100%" : "auto",
                right: isEvenRow ? "auto" : "100%",
                width: positionInRow < itemsPerRow - 1 ? "100%" : "50%",
                transform: positionInRow === itemsPerRow - 1 ? "translateY(80px)" : "translateY(-50%)",
              }}
            />
          )}

          {/* Node Button */}
          <button
            onClick={() => handleNodeClick(lesson)}
            disabled={lesson.isLocked}
            className={cn(
              "relative group w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300",
              "border-4 border-background shadow-lg",
              getNodeColor(lesson),
              !lesson.isLocked && "hover:scale-110 hover:shadow-glow cursor-pointer",
              lesson.isLocked && "cursor-not-allowed opacity-60"
            )}
          >
            <div className="relative z-10">
              {getNodeIcon(lesson)}
            </div>

            {/* Glow effect for active lessons */}
            {!lesson.isLocked && !lesson.isCompleted && lesson.progress === 0 && (
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse" />
            )}
          </button>

          {/* Lesson title below node */}
          <div className="absolute top-24 left-1/2 -translate-x-1/2 w-32 text-center">
            <p className={cn(
              "text-sm font-semibold mb-1",
              lesson.isLocked ? "text-muted-foreground" : "text-foreground"
            )}>
              {lesson.title}
            </p>
            
            {/* Progress bar for incomplete lessons */}
            {!lesson.isCompleted && lesson.progress > 0 && (
              <Progress value={lesson.progress} className="h-2" />
            )}
          </div>
        </div>
      );

      currentRow.push(node);
    });

    return currentRow;
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Parcours d'Apprentissage
          </h2>
          <p className="text-muted-foreground text-lg">
            Suivez le chemin et complétez tous les défis pour maîtriser la langue des signes
          </p>
        </div>

        {/* Quiz Path */}
        <div className="relative min-h-[800px] py-8">
          {renderPath()}
        </div>

        {/* Legend */}
        <div className="mt-12 pt-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-4 text-center">Légende</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-3xl mx-auto">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">Disponible</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">En cours</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-success text-success-foreground flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">Terminé</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full gradient-candy text-white flex items-center justify-center">
                <Star className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">Bonus</span>
            </div>
            
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-muted text-muted-foreground flex items-center justify-center opacity-60">
                <Lock className="w-5 h-5" />
              </div>
              <span className="text-xs text-center">Verrouillé</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
