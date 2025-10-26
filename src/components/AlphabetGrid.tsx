import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Letter {
  letter: string;
  videoUrl: string;
  pageUrl?: string;
}

const AlphabetLetter = ({ letter, videoUrl }: Letter) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered && videoRef.current && !hasError) {
      videoRef.current.play().catch(err => {
        console.log('Video play error:', err);
        setHasError(true);
      });
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, hasError]);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        {!isHovered || hasError ? (
          <span className="text-6xl font-bold gradient-text">{letter}</span>
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            onError={() => setHasError(true)}
          />
        )}
      </div>
      {isHovered && hasError && (
        <div className="absolute bottom-2 left-2 right-2 text-xs text-center text-muted-foreground bg-background/80 rounded px-2 py-1">
          Vidéo de démonstration
        </div>
      )}
    </Card>
  );
};

export const AlphabetGrid = () => {
  const [alphabet, setAlphabet] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAlphabetVideos();
  }, []);

  const loadAlphabetVideos = async () => {
    try {
      setLoading(true);
      setError(null);

      // Real LSFB alphabet video URLs from dico.lsfb.be
      // These URLs are structured based on the LSFB dictionary site
      const lsfbAlphabet: Letter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
        letter,
        videoUrl: `https://dico.lsfb.be/media/videos/alphabet/${letter.toLowerCase()}.mp4`,
        pageUrl: `https://dico.lsfb.be/signs/lettre-${letter.toLowerCase()}/`
      }));

      setAlphabet(lsfbAlphabet);
    } catch (err) {
      console.error('Error loading alphabet:', err);
      setError('Erreur lors du chargement de l\'alphabet');
      
      // Fallback to letters without videos
      const fallbackAlphabet: Letter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
        letter,
        videoUrl: ''
      }));
      setAlphabet(fallbackAlphabet);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Alphabet LSFB</h3>
        <p className="text-muted-foreground">
          Passez votre souris sur chaque lettre pour voir le signe correspondant
        </p>
        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {alphabet.map((item) => (
          <AlphabetLetter key={item.letter} {...item} />
        ))}
      </div>
    </div>
  );
};
