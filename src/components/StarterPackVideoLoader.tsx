import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ESSENTIAL_WORDS = {
  adult: ['Bonjour', 'comment', 'allez', 'vous', 'Merci', 'Au revoir', "S'il vous plaît"],
  child: ['Le', 'chat', 'est', 'mignon', 'chien', 'poisson', 'oiseau']
};

const ALL_WORDS = [...new Set([...ESSENTIAL_WORDS.adult, ...ESSENTIAL_WORDS.child])];

const STORAGE_KEY = 'lsfb_starter_pack_loaded';

export const StarterPackVideoLoader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(ALL_WORDS.length);
  const [isComplete, setIsComplete] = useState(false);
  const [failedWords, setFailedWords] = useState<string[]>([]);

  useEffect(() => {
    const hasLoaded = localStorage.getItem(STORAGE_KEY);
    if (!hasLoaded) {
      // Wait 2 seconds after page load before starting
      const timer = setTimeout(() => {
        startLoading();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const startLoading = async () => {
    setIsVisible(true);
    setIsLoading(true);
    
    try {
      // Check which words are already in the database
      const { data: existingWords } = await supabase
        .from('word_signs')
        .select('word')
        .in('word', ALL_WORDS);

      const existingWordsList = existingWords?.map(w => w.word.toLowerCase()) || [];
      const missingWords = ALL_WORDS.filter(
        word => !existingWordsList.includes(word.toLowerCase())
      );

      console.log(`Found ${existingWords?.length || 0} existing videos, fetching ${missingWords.length} missing videos...`);
      
      setLoadedCount(existingWords?.length || 0);
      setTotalWords(ALL_WORDS.length);

      if (missingWords.length === 0) {
        completeLoading([], existingWords?.length || 0);
        return;
      }

      // Download missing videos in batches of 5
      const failed: string[] = [];
      const batchSize = 5;
      
      for (let i = 0; i < missingWords.length; i += batchSize) {
        const batch = missingWords.slice(i, i + batchSize);
        
        const results = await Promise.allSettled(
          batch.map(word => fetchVideoForWord(word))
        );

        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            setLoadedCount(prev => prev + 1);
          } else {
            failed.push(batch[index]);
          }
        });

        // Delay between batches
        if (i + batchSize < missingWords.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      completeLoading(failed, ALL_WORDS.length - failed.length);

    } catch (error) {
      console.error('Error loading starter pack videos:', error);
      setIsLoading(false);
      toast({
        title: "Erreur",
        description: "Impossible de charger les vidéos essentielles",
        variant: "destructive",
      });
    }
  };

  const fetchVideoForWord = async (word: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-and-store-lsfb-video', {
        body: { word, type: 'word' }
      });

      if (error) {
        console.error(`Failed to fetch video for word: ${word}`, error);
        return false;
      }

      return !!data?.video_url;
    } catch (error) {
      console.error(`Error fetching video for word: ${word}`, error);
      return false;
    }
  };

  const completeLoading = (failed: string[], successCount: number) => {
    setFailedWords(failed);
    setIsComplete(true);
    setIsLoading(false);
    localStorage.setItem(STORAGE_KEY, 'true');

    if (failed.length === 0) {
      toast({
        title: "Vidéos chargées",
        description: `Toutes les vidéos essentielles (${successCount}/${totalWords}) sont prêtes !`,
      });
    } else {
      toast({
        title: "Chargement terminé",
        description: `${successCount}/${totalWords} vidéos chargées. ${failed.length} échec(s).`,
        variant: "destructive",
      });
    }

    // Auto-hide after 5 seconds if successful
    if (failed.length === 0) {
      setTimeout(() => setIsVisible(false), 5000);
    }
  };

  if (!isVisible) return null;

  const progress = (loadedCount / totalWords) * 100;

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 shadow-lg z-50 border-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {isComplete && !isLoading && (
            <Check className="h-4 w-4 text-green-600" />
          )}
          <h4 className="font-semibold text-sm">
            {isLoading ? "Chargement des vidéos..." : "Vidéos chargées"}
          </h4>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progression</span>
          <span className="font-medium">
            {loadedCount}/{totalWords}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {isComplete && failedWords.length > 0 && (
        <div className="mt-3 text-xs text-destructive">
          <p className="font-medium">Échecs : {failedWords.join(', ')}</p>
        </div>
      )}

      {isComplete && failedWords.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          ✓ Toutes les vidéos du starter pack sont disponibles
        </p>
      )}
    </Card>
  );
};
