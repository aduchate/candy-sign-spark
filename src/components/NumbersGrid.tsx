import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NumberSign {
  number: string;
  numberWord: string;
  videoUrl: string;
}

export const NumbersGrid = () => {
  const [numbers, setNumbers] = useState<NumberSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredNumber, setHoveredNumber] = useState<string | null>(null);

  const numbersData = [
    { number: "0", numberWord: "zéro" },
    { number: "1", numberWord: "un" },
    { number: "2", numberWord: "deux" },
    { number: "3", numberWord: "trois" },
    { number: "4", numberWord: "quatre" },
    { number: "5", numberWord: "cinq" },
    { number: "6", numberWord: "six" },
    { number: "7", numberWord: "sept" },
    { number: "8", numberWord: "huit" },
    { number: "9", numberWord: "neuf" },
    { number: "10", numberWord: "dix" },
  ];

  useEffect(() => {
    loadNumbersVideos();
  }, []);

  const loadNumbersVideos = async () => {
    setLoading(true);
    
    const numbersWithVideos: NumberSign[] = await Promise.all(
      numbersData.map(async (item) => {
        // Check if video exists in database
        const { data: existingVideo } = await supabase
          .from("word_signs")
          .select("video_url")
          .eq("word", item.numberWord)
          .maybeSingle();

        if (existingVideo?.video_url) {
          return {
            number: item.number,
            numberWord: item.numberWord,
            videoUrl: existingVideo.video_url,
          };
        }

        // If not found, fetch it
        try {
          const { data: fetchData } = await supabase.functions.invoke(
            "fetch-and-store-lsfb-video",
            {
              body: { word: item.numberWord, type: "word" },
            }
          );

          return {
            number: item.number,
            numberWord: item.numberWord,
            videoUrl: fetchData?.videoUrl || "",
          };
        } catch (error) {
          console.error(`Error fetching video for ${item.numberWord}:`, error);
          return {
            number: item.number,
            numberWord: item.numberWord,
            videoUrl: "",
          };
        }
      })
    );

    setNumbers(numbersWithVideos);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des chiffres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Les Chiffres en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Cliquez sur un chiffre pour voir sa vidéo en langue des signes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {numbers.map((item) => (
          <NumberCard
            key={item.number}
            number={item.number}
            numberWord={item.numberWord}
            videoUrl={item.videoUrl}
            isHovered={hoveredNumber === item.number}
            onHover={setHoveredNumber}
          />
        ))}
      </div>
    </div>
  );
};

interface NumberCardProps {
  number: string;
  numberWord: string;
  videoUrl: string;
  isHovered: boolean;
  onHover: (number: string | null) => void;
}

const NumberCard = ({ number, numberWord, videoUrl, isHovered, onHover }: NumberCardProps) => {
  return (
    <Card
      className="p-4 hover:shadow-candy transition-all cursor-pointer relative"
      onMouseEnter={() => onHover(number)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="aspect-square flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-2">{number}</div>
        <p className="text-xs text-muted-foreground text-center">{numberWord}</p>
        
        {!videoUrl && (
          <div className="mt-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      {/* Video overlay on hover */}
      {isHovered && videoUrl && (
        <div className="absolute inset-0 bg-black/90 rounded-lg flex items-center justify-center p-2">
          <video
            src={videoUrl}
            className="w-full h-full object-contain rounded"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
      )}
    </Card>
  );
};
