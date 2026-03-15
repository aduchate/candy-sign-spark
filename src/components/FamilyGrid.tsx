import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Family {
  word: string;
  videoUrl: string;
}

export const FamilyGrid = () => {
  const [family, setFamily] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const familyWords = ['papa', 'maman', 'frère', 'sœur', 'grand-père', 'grand-mère', 'bébé'];

  useEffect(() => {
    loadFamilyVideos();
  }, []);

  const loadFamilyVideos = async () => {
    setLoading(true);
    
    const familyWithVideos: Family[] = await Promise.all(
      familyWords.map(async (word) => {
        const { data } = await supabase
          .from("word_signs")
          .select("video_url")
          .ilike("word", word)
          .maybeSingle();

        return {
          word,
          videoUrl: data?.video_url || "",
        };
      })
    );

    setFamily(familyWithVideos);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement de la famille...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Famille en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Survolez un mot pour voir sa vidéo en langue des signes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {family.map((item) => (
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
                  <div className="text-xl font-bold text-center capitalize">{item.word}</div>
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
