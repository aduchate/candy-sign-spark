import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

interface FlashCardItem {
  front: string;
  back: string;
  label: string;
}

interface FlashCardsProps {
  items: FlashCardItem[];
  title: string;
  isChildMode?: boolean;
}

export const FlashCards = ({ items, title, isChildMode = false }: FlashCardsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const currentItem = items[currentIndex];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className={`text-2xl font-bold mb-2 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
          {title}
        </h3>
        <p className="text-muted-foreground">
          {isChildMode ? "Clique sur la carte pour révéler le signe ! 🎴" : "Cliquez sur la carte pour révéler le signe"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Carte {currentIndex + 1} / {items.length}
        </p>
      </div>

      <div className="flex justify-center items-center min-h-[400px]">
        <Card
          className={`relative w-full max-w-md aspect-[3/4] cursor-pointer transition-all duration-500 transform-gpu hover:scale-105 ${
            isChildMode ? "border-4 border-primary shadow-candy" : "border-2"
          }`}
          onClick={handleFlip}
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 backface-hidden"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="text-center">
              <div className={`${isChildMode ? "text-8xl" : "text-7xl"} font-bold mb-4 ${isChildMode ? "animate-bounce" : ""}`}>
                {currentItem.front}
              </div>
              <p className={`${isChildMode ? "text-xl" : "text-lg"} text-muted-foreground`}>
                {currentItem.label}
              </p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 flex items-center justify-center p-8 backface-hidden bg-gradient-to-br from-primary/10 to-accent/10"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {currentItem.back && (
              <video
                src={currentItem.back}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-contain rounded"
              />
            )}
          </div>
        </Card>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          onClick={handlePrev}
          variant={isChildMode ? "default" : "outline"}
          size="lg"
          className={isChildMode ? "gradient-candy" : ""}
        >
          <ChevronLeft className="w-5 h-5 mr-2" />
          {isChildMode ? "Précédent" : "Précédente"}
        </Button>
        
        <Button
          onClick={() => {
            setCurrentIndex(0);
            setIsFlipped(false);
          }}
          variant="outline"
          size="lg"
        >
          <RotateCcw className="w-5 h-5" />
        </Button>

        <Button
          onClick={handleNext}
          variant={isChildMode ? "default" : "outline"}
          size="lg"
          className={isChildMode ? "gradient-accent" : ""}
        >
          {isChildMode ? "Suivant" : "Suivante"}
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};