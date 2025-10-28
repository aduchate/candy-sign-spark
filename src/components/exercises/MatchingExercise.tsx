import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { ConfettiCelebration } from "./ConfettiCelebration";

interface MatchingItem {
  id: string;
  text: string;
  video: string;
}

interface MatchingExerciseProps {
  items: MatchingItem[];
  title: string;
  isChildMode?: boolean;
}

export const MatchingExercise = ({ items, title, isChildMode = false }: MatchingExerciseProps) => {
  const [selectedText, setSelectedText] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [matches, setMatches] = useState<Set<string>>(new Set());
  const [shuffledVideos, setShuffledVideos] = useState<MatchingItem[]>([]);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<"fireworks" | "balloons" | "petals">("petals");

  useEffect(() => {
    // Shuffle videos
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
  }, [items]);

  const handleTextClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedText(id);
    
    if (selectedVideo) {
      checkMatch(id, selectedVideo);
    }
  };

  const handleVideoClick = (id: string) => {
    if (matches.has(id)) return;
    setSelectedVideo(id);
    
    if (selectedText) {
      checkMatch(selectedText, id);
    }
  };

  const checkMatch = (textId: string, videoId: string) => {
    if (textId === videoId) {
      setMatches(new Set([...matches, textId]));
      if (isChildMode) {
        // Random celebration type
        const types: Array<"fireworks" | "balloons" | "petals"> = ["fireworks", "balloons", "petals"];
        const randomType = types[Math.floor(Math.random() * types.length)];
        setCelebrationType(randomType);
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 2000);
        
        toast.success("Super ! 🌟", {
          description: "C'est une paire parfaite !",
        });
      } else {
        toast.success("Correct !", {
          description: "Bonne association !",
        });
      }
    } else {
      if (isChildMode) {
        toast.error("Oups ! 😊", {
          description: "Ce n'est pas la bonne paire, essaie encore !",
        });
      } else {
        toast.error("Incorrect", {
          description: "Ce n'est pas la bonne association.",
        });
      }
    }
    
    setSelectedText(null);
    setSelectedVideo(null);
  };

  const handleRestart = () => {
    setMatches(new Set());
    setSelectedText(null);
    setSelectedVideo(null);
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setShuffledVideos(shuffled);
  };

  const isCompleted = matches.size === items.length;

  if (isCompleted) {
    return (
      <div className="space-y-6">
        {isChildMode && <ConfettiCelebration show={true} type="balloons" />}
        <Card className={`p-12 text-center ${isChildMode ? "border-4 border-primary shadow-candy" : ""}`}>
          <div className={`text-6xl mb-4 ${isChildMode ? "animate-bounce" : ""}`}>
            🎊
          </div>
          <h3 className={`text-3xl font-bold mb-4 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
            {isChildMode ? "Bravo champion ! 🏆" : "Exercice terminé !"}
          </h3>
          <p className="text-xl text-muted-foreground mb-6">
            {isChildMode
              ? "Tu as trouvé toutes les paires ! Tu es un super apprenant !"
              : "Vous avez trouvé toutes les paires correctement !"}
          </p>
          <Button
            onClick={handleRestart}
            size="lg"
            className={isChildMode ? "gradient-candy" : ""}
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            {isChildMode ? "Rejouer" : "Recommencer"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {isChildMode && showCelebration && <ConfettiCelebration show={showCelebration} type={celebrationType} />}
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
          {title}
        </h3>
        <p className="text-muted-foreground">
          {isChildMode
            ? "Associe chaque lettre/chiffre avec son signe ! 🔗"
            : "Associez chaque lettre/chiffre avec la vidéo correspondante"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {matches.size} / {items.length} trouvés
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Text column */}
        <div className="space-y-3">
          <h4 className="font-semibold text-center mb-4">
            {isChildMode ? "Lettres / Chiffres 🔤" : "Lettres / Chiffres"}
          </h4>
          {items.map((item) => (
            <Card
              key={`text-${item.id}`}
              className={`p-6 cursor-pointer transition-all duration-300 text-center ${
                matches.has(item.id)
                  ? "bg-green-50 dark:bg-green-950 ring-2 ring-green-500"
                  : selectedText === item.id
                  ? "ring-4 ring-primary scale-105"
                  : isChildMode
                  ? "border-2 border-primary/30 hover:border-primary hover:scale-105"
                  : "hover:shadow-lg hover:scale-105"
              }`}
              onClick={() => handleTextClick(item.id)}
            >
              <div className="flex items-center justify-center gap-3">
                <span className={`${isChildMode ? "text-4xl" : "text-3xl"} font-bold`}>
                  {item.text}
                </span>
                {matches.has(item.id) && <CheckCircle className="w-6 h-6 text-green-600" />}
              </div>
            </Card>
          ))}
        </div>

        {/* Video column */}
        <div className="space-y-3">
          <h4 className="font-semibold text-center mb-4">
            {isChildMode ? "Signes 👋" : "Signes"}
          </h4>
          {shuffledVideos.map((item) => (
            <Card
              key={`video-${item.id}`}
              className={`p-4 cursor-pointer transition-all duration-300 aspect-video ${
                matches.has(item.id)
                  ? "bg-green-50 dark:bg-green-950 ring-2 ring-green-500"
                  : selectedVideo === item.id
                  ? "ring-4 ring-primary scale-105"
                  : isChildMode
                  ? "border-2 border-accent/30 hover:border-accent hover:scale-105"
                  : "hover:shadow-lg hover:scale-105"
              }`}
              onClick={() => handleVideoClick(item.id)}
            >
              {item.video && (
                <video
                  src={item.video}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-contain rounded"
                />
              )}
              {matches.has(item.id) && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};