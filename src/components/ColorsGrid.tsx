import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Color {
  word: string;
  videoUrl: string;
  color: string;
}

export const ColorsGrid = () => {
  const [colors, setColors] = useState<Color[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const colorData = [
    { word: 'rouge', color: '#ef4444' },
    { word: 'bleu', color: '#3b82f6' },
    { word: 'jaune', color: '#eab308' },
    { word: 'vert', color: '#22c55e' },
    { word: 'orange', color: '#f97316' },
    { word: 'rose', color: '#ec4899' },
    { word: 'noir', color: '#000000' },
    { word: 'blanc', color: '#ffffff' }
  ];

  useEffect(() => {
    loadColorsVideos();
  }, []);

  const loadColorsVideos = async () => {
    setLoading(true);
    
    const colorsWithVideos: Color[] = await Promise.all(
      colorData.map(async (item) => {
        const { data } = await supabase
          .from("word_signs")
          .select("video_url")
          .ilike("word", item.word)
          .maybeSingle();

        return {
          word: item.word,
          videoUrl: data?.video_url || "",
          color: item.color
        };
      })
    );

    setColors(colorsWithVideos);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des couleurs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Couleurs en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Survolez une couleur pour voir sa vidéo en langue des signes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {colors.map((item) => (
          <Card
            key={item.word}
            className="p-4 hover:shadow-glow transition-all cursor-pointer relative aspect-square"
            onMouseEnter={() => setHoveredWord(item.word)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            <div className="h-full flex flex-col items-center justify-center">
              {hoveredWord === item.word && item.videoUrl ? (
                <video
                  src={item.videoUrl}
                  className="w-full h-full object-contain rounded"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <>
                  <div 
                    className="w-16 h-16 rounded-full mb-2 border-2 border-border"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="text-lg font-bold text-center capitalize">{item.word}</div>
                  {!item.videoUrl && (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
                  )}
                </>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
