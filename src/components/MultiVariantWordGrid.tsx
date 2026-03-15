import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface WordVariant {
  word: string;
  videoUrl: string;
  variantIndex: number;
  id: string;
}

// Palette de couleurs distinctes pour différencier les mots
const WORD_COLORS = [
  { bg: "hsl(220, 70%, 92%)", border: "hsl(220, 70%, 60%)" },
  { bg: "hsl(340, 70%, 92%)", border: "hsl(340, 70%, 60%)" },
  { bg: "hsl(160, 60%, 90%)", border: "hsl(160, 60%, 50%)" },
  { bg: "hsl(45, 80%, 90%)", border: "hsl(45, 80%, 55%)" },
  { bg: "hsl(280, 60%, 92%)", border: "hsl(280, 60%, 60%)" },
  { bg: "hsl(15, 70%, 92%)", border: "hsl(15, 70%, 58%)" },
  { bg: "hsl(190, 70%, 90%)", border: "hsl(190, 70%, 50%)" },
  { bg: "hsl(100, 50%, 90%)", border: "hsl(100, 50%, 50%)" },
  { bg: "hsl(260, 50%, 92%)", border: "hsl(260, 50%, 60%)" },
  { bg: "hsl(0, 60%, 92%)", border: "hsl(0, 60%, 58%)" },
  { bg: "hsl(210, 50%, 90%)", border: "hsl(210, 50%, 55%)" },
  { bg: "hsl(30, 70%, 90%)", border: "hsl(30, 70%, 55%)" },
  { bg: "hsl(320, 50%, 92%)", border: "hsl(320, 50%, 58%)" },
  { bg: "hsl(140, 50%, 90%)", border: "hsl(140, 50%, 50%)" },
  { bg: "hsl(60, 60%, 90%)", border: "hsl(60, 60%, 50%)" },
];

interface MultiVariantWordGridProps {
  title: string;
  description: string;
  words: string[];
}

export const MultiVariantWordGrid = ({ title, description, words }: MultiVariantWordGridProps) => {
  const [variants, setVariants] = useState<WordVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    loadAllVariants();
  }, []);

  const loadAllVariants = async () => {
    setLoading(true);

    const allVariants: WordVariant[] = [];

    await Promise.all(
      words.map(async (word) => {
        // Fetch ALL matching entries (multiple variants)
        const { data } = await supabase
          .from("word_signs")
          .select("id, word, video_url")
          .ilike("word", word);

        if (data && data.length > 0) {
          data.forEach((row, index) => {
            allVariants.push({
              word: row.word,
              videoUrl: row.video_url,
              variantIndex: index,
              id: row.id,
            });
          });
        } else {
          // Mot sans vidéo encore
          allVariants.push({
            word,
            videoUrl: "",
            variantIndex: 0,
            id: `missing-${word}`,
          });
        }
      })
    );

    // Trier: grouper par mot (ordre original), puis par variant
    const wordOrder = new Map(words.map((w, i) => [w.toLowerCase(), i]));
    allVariants.sort((a, b) => {
      const orderA = wordOrder.get(a.word.toLowerCase()) ?? 999;
      const orderB = wordOrder.get(b.word.toLowerCase()) ?? 999;
      if (orderA !== orderB) return orderA - orderB;
      return a.variantIndex - b.variantIndex;
    });

    setVariants(allVariants);
    setLoading(false);
  };

  // Assigner une couleur à chaque mot unique
  const getWordColor = (word: string) => {
    const uniqueWords = [...new Set(words.map(w => w.toLowerCase()))];
    const index = uniqueWords.indexOf(word.toLowerCase());
    return WORD_COLORS[index % WORD_COLORS.length];
  };

  // Compter les variantes par mot
  const getVariantCount = (word: string) => {
    return variants.filter(v => v.word.toLowerCase() === word.toLowerCase()).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">{title}</h3>
        <p className="text-muted-foreground mb-6">{description}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {variants.map((item) => {
          const color = getWordColor(item.word);
          const variantCount = getVariantCount(item.word);
          const showVariantLabel = variantCount > 1;

          return (
            <Card
              key={item.id}
              className="p-4 transition-all cursor-pointer relative aspect-square"
              style={{
                backgroundColor: hoveredId === item.id ? undefined : color.bg,
                borderColor: color.border,
                borderWidth: "2px",
              }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="h-full flex flex-col items-center justify-center">
                {hoveredId === item.id && item.videoUrl ? (
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
                    <div className="text-xl font-bold text-center" style={{ color: color.border }}>
                      {item.word}
                    </div>
                    {showVariantLabel && (
                      <div
                        className="text-xs font-medium mt-1 px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: color.border, color: "white" }}
                      >
                        variante {item.variantIndex + 1}
                      </div>
                    )}
                    {!item.videoUrl && (
                      <Loader2 className="h-6 w-6 animate-spin mt-2" style={{ color: color.border }} />
                    )}
                  </>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
