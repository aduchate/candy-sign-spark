import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WordVariant {
  word: string;
  videoUrl: string;
  variantIndex: number;
  id: string;
}

export interface WordGroup {
  label: string;
  words: string[];
}

interface MultiVariantWordGridProps {
  title: string;
  description: string;
  words?: string[];
  wordGroups?: WordGroup[];
}

export const MultiVariantWordGrid = ({ title, description, words, wordGroups }: MultiVariantWordGridProps) => {
  const [variants, setVariants] = useState<WordVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Flatten all words from either words or wordGroups
  const allWords = wordGroups
    ? wordGroups.flatMap(g => g.words)
    : words || [];

  useEffect(() => {
    loadAllVariants();
  }, []);

  const loadAllVariants = async () => {
    setLoading(true);
    const allVariants: WordVariant[] = [];

    await Promise.all(
      allWords.map(async (word) => {
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
          try {
            await supabase.functions.invoke('fetch-corpus-lsfb-variants', {
              body: { word }
            });
            const { data: newData } = await supabase
              .from("word_signs")
              .select("id, word, video_url")
              .ilike("word", word);
            if (newData && newData.length > 0) {
              newData.forEach((row, index) => {
                allVariants.push({
                  word: row.word,
                  videoUrl: row.video_url,
                  variantIndex: index,
                  id: row.id,
                });
              });
            } else {
              allVariants.push({ word, videoUrl: "", variantIndex: 0, id: `missing-${word}` });
            }
          } catch {
            allVariants.push({ word, videoUrl: "", variantIndex: 0, id: `missing-${word}` });
          }
        }
      })
    );

    setVariants(allVariants);
    setLoading(false);
  };

  const getVariantsForWord = (word: string) =>
    variants.filter(v => v.word.toLowerCase() === word.toLowerCase())
      .sort((a, b) => a.variantIndex - b.variantIndex);

  const getVariantCount = (word: string) =>
    variants.filter(v => v.word.toLowerCase() === word.toLowerCase()).length;

  const renderCard = (item: WordVariant) => {
    const variantCount = getVariantCount(item.word);
    const showVariantLabel = variantCount > 1;

    return (
      <Card
        key={item.id}
        className="p-4 transition-all cursor-pointer aspect-square border border-border hover:shadow-md"
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
              <div className="text-xl font-bold text-center text-foreground">
                {item.word}
              </div>
              {showVariantLabel && (
                <div className="text-xs font-medium mt-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  variante {item.variantIndex + 1}
                </div>
              )}
              {!item.videoUrl && (
                <Loader2 className="h-6 w-6 animate-spin mt-2 text-muted-foreground" />
              )}
            </>
          )}
        </div>
      </Card>
    );
  };

  const renderWordCards = (wordList: string[]) => {
    const cards: WordVariant[] = [];
    for (const word of wordList) {
      const wordVariants = getVariantsForWord(word);
      if (wordVariants.length > 0) {
        cards.push(...wordVariants);
      } else {
        cards.push({ word, videoUrl: "", variantIndex: 0, id: `missing-${word}` });
      }
    }
    return cards.map(renderCard);
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
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-2">{description}</p>
        <p className="text-xs text-muted-foreground">
          Certains mots peuvent avoir plusieurs variantes de signe.{" "}
          <a
            href="https://www.mot-signe.be/lexicons"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 underline hover:text-foreground transition-colors"
          >
            Voir plus sur mot-signe.be <ExternalLink className="h-3 w-3" />
          </a>
        </p>
      </div>

      {wordGroups ? (
        wordGroups.map((group) => (
          <div key={group.label}>
            <h4 className="text-lg font-semibold mb-3 text-foreground">{group.label}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {renderWordCards(group.words)}
            </div>
          </div>
        ))
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {renderWordCards(allWords)}
        </div>
      )}

      <div className="flex justify-center pt-2">
        <Button variant="outline" size="sm" asChild>
          <a
            href={`https://www.mot-signe.be/lexicons?search=${encodeURIComponent(allWords[0] || '')}&sign-status=all`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2"
          >
            Explorer les variantes sur mot-signe.be <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </div>
    </div>
  );
};
