import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface LessonCardProps {
  id: string;
  title: string;
  level: "A1" | "A2" | "B1" | "B2";
  category: string;
  progress?: number;
  isLocked?: boolean;
  isCompleted?: boolean;
}

const levelColors = {
  A1: "bg-green-500",
  A2: "bg-blue-500",
  B1: "bg-orange-500",
  B2: "bg-purple-500",
};

const levelLabels = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Avancé",
};

export const LessonCard = ({
  id,
  title,
  level,
  category,
  progress = 0,
  isLocked = false,
  isCompleted = false,
}: LessonCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (!isLocked) {
      navigate(`/lesson/${id}`);
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-lg ${
        isLocked ? "opacity-50 cursor-not-allowed" : ""
      }`}
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              {title}
              {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
              {isLocked && <Lock className="h-5 w-5" />}
            </CardTitle>
            <CardDescription>{category}</CardDescription>
          </div>
          <Badge className={levelColors[level]}>
            {level} - {levelLabels[level]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {!isLocked && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
