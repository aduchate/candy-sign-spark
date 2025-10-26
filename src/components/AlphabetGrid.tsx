import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Letter {
  letter: string;
  gifUrl: string;
}

interface AlphabetLetterProps extends Letter {
  onFetch: (letter: string) => void;
  isLoading: boolean;
}

const AlphabetLetter = ({ letter, gifUrl, onFetch, isLoading }: AlphabetLetterProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (!gifUrl && !isLoading) {
      onFetch(letter);
    }
  };

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        {isLoading ? (
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        ) : isHovered && gifUrl ? (
          <video
            src={gifUrl}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl font-bold gradient-text">{letter}</span>
        )}
      </div>
      {!gifUrl && !isLoading && (
        <div className="absolute bottom-1 right-1 text-xs text-muted-foreground bg-background/80 px-1 rounded">
          Cliquez
        </div>
      )}
    </Card>
  );
};

export const AlphabetGrid = () => {
  const [alphabet, setAlphabet] = useState<Letter[]>(
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
      letter,
      gifUrl: ''
    }))
  );
  const [loading, setLoading] = useState(true);
  const [loadingLetter, setLoadingLetter] = useState<string | null>(null);

  useEffect(() => {
    loadAlphabetVideos();
  }, []);

  const loadAlphabetVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('alphabet_signs')
        .select('letter, video_url');

      if (error) throw error;

      if (data && data.length > 0) {
        setAlphabet(prev => prev.map(item => {
          const found = data.find(d => d.letter === item.letter);
          return found ? { ...item, gifUrl: found.video_url } : item;
        }));
      }
    } catch (error) {
      console.error('Error loading alphabet videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideoForLetter = async (letter: string) => {
    if (loadingLetter) return;
    
    setLoadingLetter(letter);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-and-store-lsfb-video', {
        body: { word: letter, type: 'alphabet' }
      });

      if (error) throw error;

      if (data?.success && data?.video_url) {
        setAlphabet(prev => prev.map(item => 
          item.letter === letter ? { ...item, gifUrl: data.video_url } : item
        ));
        toast({
          title: "Vidéo chargée",
          description: `La vidéo pour la lettre ${letter} a été chargée avec succès`,
        });
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      toast({
        title: "Erreur",
        description: `Impossible de charger la vidéo pour ${letter}`,
        variant: "destructive",
      });
    } finally {
      setLoadingLetter(null);
    }
  };


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Alphabet LSFB</h3>
        <p className="text-muted-foreground">
          {loading ? "Chargement des vidéos..." : "Survolez une lettre pour voir la vidéo. Cliquez si elle n'est pas encore chargée."}
        </p>
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {alphabet.map((item) => (
          <AlphabetLetter 
            key={item.letter} 
            {...item} 
            onFetch={fetchVideoForLetter}
            isLoading={loadingLetter === item.letter}
          />
        ))}
      </div>
    </div>
  );
};
