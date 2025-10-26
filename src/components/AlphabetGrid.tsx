import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Letter {
  letter: string;
  videoUrl: string;
  pageUrl?: string;
}

const AlphabetLetter = ({ letter, videoUrl, pageUrl }: Letter) => {
  const [isHovered, setIsHovered] = useState(false);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered && pageUrl && !videoSrc && !loading) {
      // Charger la vidéo depuis la page LSFB
      setLoading(true);
      supabase.functions
        .invoke('fetch-lsfb-sign', {
          body: { signUrl: pageUrl }
        })
        .then(({ data, error }) => {
          if (error) {
            console.error('Error fetching video:', error);
          } else if (data?.videoUrl) {
            setVideoSrc(data.videoUrl);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [isHovered, pageUrl, videoSrc, loading]);

  useEffect(() => {
    if (isHovered && videoRef.current && videoSrc) {
      videoRef.current.play().catch(err => {
        console.log('Video play error:', err);
      });
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered, videoSrc]);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        {!isHovered || !videoSrc ? (
          <span className="text-6xl font-bold gradient-text">{letter}</span>
        ) : (
          <video
            ref={videoRef}
            src={videoSrc}
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        {isHovered && loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>
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

      // Vraies URLs LSFB pour chaque lettre de l'alphabet
      const lsfbAlphabet: Letter[] = [
        { letter: "A", videoUrl: "https://dico.lsfb.be/signs/a-3/", pageUrl: "https://dico.lsfb.be/signs/a-3/" },
        { letter: "B", videoUrl: "https://dico.lsfb.be/signs/b-2/", pageUrl: "https://dico.lsfb.be/signs/b-2/" },
        { letter: "C", videoUrl: "https://dico.lsfb.be/signs/c-2/", pageUrl: "https://dico.lsfb.be/signs/c-2/" },
        { letter: "D", videoUrl: "https://dico.lsfb.be/signs/d-3/", pageUrl: "https://dico.lsfb.be/signs/d-3/" },
        { letter: "E", videoUrl: "https://dico.lsfb.be/signs/e-2/", pageUrl: "https://dico.lsfb.be/signs/e-2/" },
        { letter: "F", videoUrl: "https://dico.lsfb.be/signs/f-2/", pageUrl: "https://dico.lsfb.be/signs/f-2/" },
        { letter: "G", videoUrl: "https://dico.lsfb.be/signs/g-2/", pageUrl: "https://dico.lsfb.be/signs/g-2/" },
        { letter: "H", videoUrl: "https://dico.lsfb.be/signs/h-2/", pageUrl: "https://dico.lsfb.be/signs/h-2/" },
        { letter: "I", videoUrl: "https://dico.lsfb.be/signs/i-2/", pageUrl: "https://dico.lsfb.be/signs/i-2/" },
        { letter: "J", videoUrl: "https://dico.lsfb.be/signs/j-2/", pageUrl: "https://dico.lsfb.be/signs/j-2/" },
        { letter: "K", videoUrl: "https://dico.lsfb.be/signs/k-2/", pageUrl: "https://dico.lsfb.be/signs/k-2/" },
        { letter: "L", videoUrl: "https://dico.lsfb.be/signs/l-2/", pageUrl: "https://dico.lsfb.be/signs/l-2/" },
        { letter: "M", videoUrl: "https://dico.lsfb.be/signs/m-2/", pageUrl: "https://dico.lsfb.be/signs/m-2/" },
        { letter: "N", videoUrl: "https://dico.lsfb.be/signs/n-2/", pageUrl: "https://dico.lsfb.be/signs/n-2/" },
        { letter: "O", videoUrl: "https://dico.lsfb.be/signs/o-2/", pageUrl: "https://dico.lsfb.be/signs/o-2/" },
        { letter: "P", videoUrl: "https://dico.lsfb.be/signs/p-2/", pageUrl: "https://dico.lsfb.be/signs/p-2/" },
        { letter: "Q", videoUrl: "https://dico.lsfb.be/signs/q-2/", pageUrl: "https://dico.lsfb.be/signs/q-2/" },
        { letter: "R", videoUrl: "https://dico.lsfb.be/signs/r-2/", pageUrl: "https://dico.lsfb.be/signs/r-2/" },
        { letter: "S", videoUrl: "https://dico.lsfb.be/signs/s-2/", pageUrl: "https://dico.lsfb.be/signs/s-2/" },
        { letter: "T", videoUrl: "https://dico.lsfb.be/signs/t-2/", pageUrl: "https://dico.lsfb.be/signs/t-2/" },
        { letter: "U", videoUrl: "https://dico.lsfb.be/signs/u-2/", pageUrl: "https://dico.lsfb.be/signs/u-2/" },
        { letter: "V", videoUrl: "https://dico.lsfb.be/signs/v-2/", pageUrl: "https://dico.lsfb.be/signs/v-2/" },
        { letter: "W", videoUrl: "https://dico.lsfb.be/signs/w-2/", pageUrl: "https://dico.lsfb.be/signs/w-2/" },
        { letter: "X", videoUrl: "https://dico.lsfb.be/signs/x-2/", pageUrl: "https://dico.lsfb.be/signs/x-2/" },
        { letter: "Y", videoUrl: "https://dico.lsfb.be/signs/y-2/", pageUrl: "https://dico.lsfb.be/signs/y-2/" },
        { letter: "Z", videoUrl: "https://dico.lsfb.be/signs/z-2/", pageUrl: "https://dico.lsfb.be/signs/z-2/" },
      ];

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
