import { GripVertical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { MultiVideoPlayer } from "@/components/MultiVideoPlayer";

interface WordCardProps {
  word: string;
  videoUrls?: string[];
  isDragging?: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
}

export const WordCard = ({ word, videoUrls, isDragging, isCorrect, showFeedback }: WordCardProps) => {
  return (
    <Card
      className={`
        p-4 cursor-move transition-all
        ${isDragging ? "opacity-50 rotate-3 scale-105" : ""}
        ${showFeedback && isCorrect !== undefined ? (isCorrect ? "border-green-500 bg-green-50 dark:bg-green-950" : "border-red-500 bg-red-50 dark:bg-red-950") : ""}
      `}
    >
      <div className="flex items-center gap-3">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        {videoUrls && videoUrls.length > 0 && (
          <MultiVideoPlayer videoUrls={videoUrls} className="w-16 h-16 object-cover rounded" />
        )}
        <span className="text-lg font-medium">{word}</span>
      </div>
    </Card>
  );
};
