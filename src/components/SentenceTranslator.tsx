import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Play, Pause, RotateCcw } from "lucide-react";

interface WordTranslation {
  word: string;
  videoUrl: string | null;
  found: boolean;
}

interface TranslationResult {
  originalText: string;
  correctedText: string;
  translations: WordTranslation[];
  stats: {
    total: number;
    found: number;
    missing: number;
  };
}

export const SentenceTranslator = () => {
  const [inputText, setInputText] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(-1);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("Veuillez entrer une phrase à traduire");
      return;
    }

    setIsTranslating(true);
    setResult(null);
    setCurrentVideoIndex(-1);

    try {
      const { data, error } = await supabase.functions.invoke('translate-sentence-lsfb', {
        body: { text: inputText }
      });

      if (error) throw error;

      if (data?.success) {
        setResult(data as TranslationResult);
        
        if (data.stats.found === 0) {
          toast.error("Aucun mot n'a été trouvé dans le dictionnaire LSFB");
        } else if (data.stats.missing > 0) {
          toast.warning(
            `${data.stats.found}/${data.stats.total} mots trouvés. ${data.stats.missing} mot(s) non disponible(s).`
          );
        } else {
          toast.success("Traduction complète réussie !");
        }
      } else {
        throw new Error(data?.error || "Erreur de traduction");
      }
    } catch (error) {
      console.error('Translation error:', error);
      toast.error("Erreur lors de la traduction");
    } finally {
      setIsTranslating(false);
    }
  };

  const playSequence = async () => {
    if (!result) return;

    const videosToPlay = result.translations.filter(t => t.videoUrl);
    if (videosToPlay.length === 0) {
      toast.error("Aucune vidéo disponible à lire");
      return;
    }

    setIsPlaying(true);
    setCurrentVideoIndex(0);

    for (let i = 0; i < videosToPlay.length; i++) {
      const videoIndex = result.translations.findIndex(
        t => t.word === videosToPlay[i].word
      );
      
      setCurrentVideoIndex(videoIndex);
      const video = videoRefs.current[videoIndex];
      
      if (video) {
        try {
          await video.play();
          await new Promise(resolve => {
            video.onended = resolve;
          });
          
          // Petite pause entre les vidéos
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error('Error playing video:', error);
        }
      }
    }

    setIsPlaying(false);
    setCurrentVideoIndex(-1);
  };

  const stopSequence = () => {
    videoRefs.current.forEach(video => {
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
    });
    setIsPlaying(false);
    setCurrentVideoIndex(-1);
  };

  const resetTranslation = () => {
    setResult(null);
    setInputText("");
    setCurrentVideoIndex(-1);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Traducteur de phrases en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Entrez une phrase en français. Le correcteur automatique corrigera les fautes et la phrase sera traduite en séquence vidéo de langue des signes.
        </p>

        <div className="space-y-4">
          <Textarea
            placeholder="Exemple: Bonjour, je veux manger"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="min-h-[100px]"
            disabled={isTranslating}
          />

          <div className="flex gap-3">
            <Button
              onClick={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
              className="gap-2 gradient-candy"
            >
              {isTranslating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Traduction...
                </>
              ) : (
                "Traduire"
              )}
            </Button>

            {result && (
              <Button
                onClick={resetTranslation}
                variant="outline"
                className="gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Nouvelle traduction
              </Button>
            )}
          </div>
        </div>
      </Card>

      {result && (
        <>
          {/* Texte corrigé */}
          {result.correctedText !== result.originalText && (
            <Card className="p-4 bg-muted/50">
              <p className="text-sm text-muted-foreground mb-1">Texte corrigé :</p>
              <p className="font-medium">{result.correctedText}</p>
            </Card>
          )}

          {/* Statistiques */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {result.stats.found} mot(s) sur {result.stats.total} traduit(s)
                </p>
                {result.stats.missing > 0 && (
                  <p className="text-sm text-destructive">
                    {result.stats.missing} mot(s) non disponible(s)
                  </p>
                )}
              </div>

              {result.stats.found > 0 && (
                <Button
                  onClick={isPlaying ? stopSequence : playSequence}
                  className="gap-2 gradient-accent"
                  disabled={isTranslating}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Arrêter
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Lire la séquence
                    </>
                  )}
                </Button>
              )}
            </div>
          </Card>

          {/* Grille de vidéos */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {result.translations.map((translation, index) => (
              <Card
                key={index}
                className={`p-4 transition-all duration-300 ${
                  currentVideoIndex === index
                    ? "ring-2 ring-primary shadow-glow scale-105"
                    : translation.found
                    ? "border-2 border-accent/50"
                    : "opacity-50 border-destructive/50"
                }`}
              >
                <h4 className="font-bold text-center mb-2 capitalize">
                  {translation.word}
                </h4>

                {translation.videoUrl ? (
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <video
                      ref={el => videoRefs.current[index] = el}
                      src={translation.videoUrl}
                      className="w-full h-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                    <p className="text-xs text-center text-muted-foreground px-2">
                      Signe non disponible
                    </p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
