import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ESSENTIAL_WORDS = {
  adult: [
    // Salutations
    'Bonjour', 'Merci', 'comment', 'vous',
    // Vocabulaire professionnel
    'travail', 'bureau', 'reunion', 'collegue', 'directeur', 'projet',
    // Temps et dates
    'aujourd\'hui', 'demain', 'hier',
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    'janvier', 'fevrier', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre',
  ],
  child: [
    // Salutations
    'Bonjour', 'Merci',
    // Animaux
    'chat', 'chien', 'poisson', 'oiseau',
    // Phrases simples
    'Le', 'est', 'mignon',
    // Couleurs
    'rouge', 'bleu', 'jaune', 'vert', 'orange', 'rose', 'noir', 'blanc',
    // Famille
    'maman', 'frere', 'soeur', 'bebe',
    // Émotions
    'content', 'triste', 'colere', 'peur', 'surpris', 'fatigue',
    // Nourriture
    'pomme', 'banane', 'pain', 'eau', 'lait', 'chocolat',
    // Jeux
    'ballon', 'jouer', 'courir', 'sauter',
  ],
  profession: [
    // Logopédie
    'bouche', 'parler', 'langue', 'voix', 'son', 'mot', 'phrase',
    'entendre', 'comprendre', 'exercice',
    // Audiologie
    'oreille', 'bruit', 'silence', 'fort', 'faible', 'appareil',
    'gauche', 'droite',
    // Psychologie
    'aider', 'famille', 'confiance', 'stress',
    // Médecine
    'mal', 'douleur', 'ventre', 'dos', 'repos',
    'examen', 'allergie', 'urgence',
    // Kinésithérapie
    'bouger', 'marcher', 'jambe', 'bras', 'muscle',
    // Éducateur
    'dormir', 'maison', 'ami', 'apprendre',
    // Communs B1-B2
    'programme', 'progrès', 'résultat',
  ],
};

type StarterProfile = "adult" | "child" | "profession";

interface StarterPackVideoLoaderProps {
  profile?: StarterProfile | null;
}

export const StarterPackVideoLoader = ({ profile }: StarterPackVideoLoaderProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [failedWords, setFailedWords] = useState<string[]>([]);

  useEffect(() => {
    if (!profile) return;

    const storageKey = `lsfb_starter_pack_loaded_${profile}`;
    const countKey = `lsfb_starter_pack_count_${profile}`;
    const words = ESSENTIAL_WORDS[profile];

    const hasLoaded = localStorage.getItem(storageKey);
    const savedCount = localStorage.getItem(countKey);
    // Re-trigger if new words were added to the list
    const needsUpdate = !hasLoaded || (savedCount && parseInt(savedCount) < words.length);
    if (needsUpdate) {
      const timer = setTimeout(() => {
        startLoading();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [profile]);

  const startLoading = async () => {
    if (!profile) return;

    const words = ESSENTIAL_WORDS[profile];
    setIsVisible(true);
    setIsLoading(true);

    try {
      // Check which words are already in the database (query in batches to avoid 1000 row limit)
      const { data: existingWords } = await supabase
        .from('word_signs')
        .select('word');

      const existingWordsList = existingWords?.map(w => w.word.toLowerCase()) || [];
      const missingWords = words.filter(
        word => !existingWordsList.includes(word.toLowerCase())
      );

      const alreadyLoaded = words.length - missingWords.length;
      console.log(`Found ${alreadyLoaded} existing videos for profile "${profile}", fetching ${missingWords.length} missing videos...`);

      setLoadedCount(alreadyLoaded);
      setTotalWords(words.length);

      if (missingWords.length === 0) {
        completeLoading([], alreadyLoaded);
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

      completeLoading(failed, words.length - failed.length);

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

    if (!profile) return;
    const storageKey = `lsfb_starter_pack_loaded_${profile}`;
    const countKey = `lsfb_starter_pack_count_${profile}`;
    const words = ESSENTIAL_WORDS[profile];

    // Don't mark as loaded if there are failures, so it will retry on next page load
    if (failed.length === 0) {
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem(countKey, words.length.toString());
      toast({
        title: "Vidéos chargées",
        description: `Toutes les vidéos essentielles (${successCount}/${totalWords}) sont prêtes !`,
      });
      // Auto-hide after 5 seconds if successful
      setTimeout(() => setIsVisible(false), 5000);
    }
  };

  const retryLoading = () => {
    if (!profile) return;
    setIsVisible(false);
    setFailedWords([]);
    setIsComplete(false);
    setLoadedCount(0);
    // Remove the storage key to force reload
    localStorage.removeItem(`lsfb_starter_pack_loaded_${profile}`);
    // Restart after a short delay
    setTimeout(() => {
      startLoading();
    }, 500);
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
        <div className="mt-3 space-y-2">
          <div className="text-xs text-destructive">
            <p className="font-medium">Mots non trouvés :</p>
            <p className="text-xs">{failedWords.slice(0, 10).join(', ')}{failedWords.length > 10 ? '...' : ''}</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={retryLoading}
          >
            Réessayer le téléchargement
          </Button>
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
