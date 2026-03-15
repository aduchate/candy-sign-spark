import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Greeting {
  word: string;
  videoUrl: string;
  variants: { video_url: string; source: string; tags: string[] }[];
}

export const GreetingsGrid = () => {
  const [greetings, setGreetings] = useState<Greeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);
  const [activeVariant, setActiveVariant] = useState<Record<string, number>>({});

  const greetingWords = ['Bonjour', 'Merci', 'Au revoir', 'S\'il vous plaît', 'comment', 'allez', 'vous'];

  useEffect(() => {
    loadGreetingsVideos();
  }, []);

  const loadGreetingsVideos = async () => {
    setLoading(true);
    
    const greetingsWithVideos: Greeting[] = await Promise.all(
      greetingWords.map(async (word) => {
        const { data } = await supabase
          .from("word_signs")
          .select("id, video_url")
          .ilike("word", word)
          .maybeSingle();

        let variants: { video_url: string; source: string; tags: string[] }[] = [];
        if (data?.id) {
          const { data: variantData } = await supabase
            .from("word_sign_variants")
            .select("video_url, source, tags")
            .eq("word_sign_id", data.id);
          variants = (variantData || []).map(v => ({
            video_url: v.video_url,
            source: v.source,
            tags: v.tags || [],
          }));
        }

        return {
          word,
          videoUrl: data?.video_url || "",
          variants,
        };
      })
    );

    setGreetings(greetingsWithVideos);
    setLoading(false);
  };

  const getActiveVideo = (item: Greeting): string => {
    const idx = activeVariant[item.word] ?? -1;
    if (idx === -1) return item.videoUrl;
    return item.variants[idx]?.video_url || item.videoUrl;
  };

  const cycleVariant = (word: string, totalVariants: number) => {
    setActiveVariant(prev => {
      const current = prev[word] ?? -1;
      const next = current + 1 > totalVariants - 1 ? -1 : current + 1;
      return { ...prev, [word]: next };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des salutations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Salutations en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Survolez un mot pour voir sa vidéo en langue des signes. Cliquez pour voir les variantes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {greetings.map((item) => (
          <Card
            key={item.word}
            className="p-4 hover:shadow-glow transition-all cursor-pointer relative aspect-square"
            onMouseEnter={() => setHoveredWord(item.word)}
            onMouseLeave={() => setHoveredWord(null)}
            onClick={() => item.variants.length > 0 && cycleVariant(item.word, item.variants.length)}
          >
            <div className="h-full flex flex-col items-center justify-center">
              {hoveredWord === item.word && (item.videoUrl || item.variants.length > 0) ? (
                <>
                  <video
                    src={getActiveVideo(item)}
                    className="w-full h-full object-contain rounded"
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  {item.variants.length > 0 && (
                    <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1">
                      <Badge
                        variant={(activeVariant[item.word] ?? -1) === -1 ? "default" : "outline"}
                        className="text-[10px] px-1 py-0"
                      >
                        dico
                      </Badge>
                      {item.variants.map((v, i) => (
                        <Badge
                          key={i}
                          variant={(activeVariant[item.word] ?? -1) === i ? "default" : "outline"}
                          className="text-[10px] px-1 py-0"
                        >
                          {v.source}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-center">{item.word}</div>
                  {!item.videoUrl && item.variants.length === 0 && (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
                  )}
                  {item.variants.length > 0 && (
                    <Badge variant="secondary" className="mt-2 text-[10px]">
                      {item.variants.length + 1} variante{item.variants.length > 0 ? 's' : ''}
                    </Badge>
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
