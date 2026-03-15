import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { X, Check, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const ESSENTIAL_WORDS = {
  adult: [
    'Bonjour', 'Merci', 'comment', 'vous',
    'travail', 'bureau', 'reunion', 'collegue', 'directeur', 'projet',
    'aujourd\'hui', 'demain', 'hier',
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    'janvier', 'fevrier', 'avril', 'mai', 'juin',
    'juillet', 'aout', 'septembre', 'octobre', 'novembre',
  ],
  child: [
    'Bonjour', 'Merci',
    'chat', 'chien', 'poisson', 'oiseau',
    'Le', 'est', 'mignon',
    'rouge', 'bleu', 'jaune', 'vert', 'orange', 'rose', 'noir', 'blanc',
    'maman', 'frere', 'soeur', 'bebe',
    'content', 'triste', 'colere', 'peur', 'surpris', 'fatigue',
    'pomme', 'banane', 'pain', 'eau', 'lait', 'chocolat',
    'ballon', 'jouer', 'courir', 'sauter',
  ],
  profession: [
    'bouche', 'parler', 'écouter', 'langue', 'voix', 'son', 'mot', 'phrase',
    'entendre', 'comprendre', 'exercice',
    'oreille', 'bruit', 'silence', 'fort', 'faible', 'test', 'appareil',
    'gauche', 'droite',
    'aider', 'famille', 'confiance', 'émotion', 'stress',
    'mal', 'douleur', 'tête', 'ventre', 'dos', 'médicament', 'repos',
    'examen', 'fièvre', 'allergie', 'urgence',
    'bouger', 'marcher', 'jambe', 'bras', 'muscle',
    'dormir', 'école', 'maison', 'ami', 'règle', 'apprendre', 'groupe',
    'consultation', 'programme', 'diagnostic', 'thérapie', 'bilan',
    'évaluation', 'progrès', 'séance', 'résultat', 'ordonnance',
  ],
};

const ALL_WORDS = [...new Set([
  ...ESSENTIAL_WORDS.adult,
  ...ESSENTIAL_WORDS.child,
  ...ESSENTIAL_WORDS.profession,
])];

const STORAGE_KEY = 'lsfb_starter_pack_loaded';
const VARIANTS_STORAGE_KEY = 'lsfb_starter_pack_variants_loaded';

export const StarterPackVideoLoader = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [totalWords, setTotalWords] = useState(ALL_WORDS.length);
  const [isComplete, setIsComplete] = useState(false);
  const [failedWords, setFailedWords] = useState<string[]>([]);
  const [phase, setPhase] = useState<'dico' | 'variants'>('dico');

  useEffect(() => {
    const hasLoaded = localStorage.getItem(STORAGE_KEY);
    const savedCount = localStorage.getItem('lsfb_starter_pack_count');
    const needsUpdate = !hasLoaded || (savedCount && parseInt(savedCount) < ALL_WORDS.length);
    if (needsUpdate) {
      const timer = setTimeout(() => startLoading(), 2000);
      return () => clearTimeout(timer);
    } else {
      // Main pack loaded, check variants
      const hasVariants = localStorage.getItem(VARIANTS_STORAGE_KEY);
      if (!hasVariants) {
        const timer = setTimeout(() => startVariantsLoading(), 3000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const startLoading = async () => {
    setIsVisible(true);
    setIsLoading(true);
    setPhase('dico');
    
    try {
      const { data: existingWords } = await supabase
        .from('word_signs')
        .select('word');

      const existingWordsList = existingWords?.map(w => w.word.toLowerCase()) || [];
      const missingWords = ALL_WORDS.filter(
        word => !existingWordsList.includes(word.toLowerCase())
      );

      setLoadedCount(existingWords?.length || 0);
      setTotalWords(ALL_WORDS.length);

      if (missingWords.length === 0) {
        completeLoading([], existingWords?.length || 0);
        return;
      }

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
        if (i + batchSize < missingWords.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      completeLoading(failed, ALL_WORDS.length - failed.length);
    } catch (error) {
      console.error('Error loading starter pack videos:', error);
      setIsLoading(false);
      toast({ title: "Erreur", description: "Impossible de charger les vidéos essentielles", variant: "destructive" });
    }
  };

  const startVariantsLoading = async () => {
    setIsVisible(true);
    setIsLoading(true);
    setPhase('variants');
    setLoadedCount(0);
    setFailedWords([]);
    setIsComplete(false);

    try {
      // Get all existing word_signs
      const { data: existingWords } = await supabase
        .from('word_signs')
        .select('id, word');

      if (!existingWords || existingWords.length === 0) {
        setIsVisible(false);
        return;
      }

      // Get existing variants
      const { data: existingVariants } = await supabase
        .from('word_sign_variants')
        .select('word_sign_id');

      const variantWordIds = new Set(existingVariants?.map(v => v.word_sign_id) || []);
      const wordsNeedingVariants = existingWords.filter(w => !variantWordIds.has(w.id));

      setTotalWords(existingWords.length);
      setLoadedCount(existingWords.length - wordsNeedingVariants.length);

      if (wordsNeedingVariants.length === 0) {
        completeVariantsLoading([]);
        return;
      }

      const failed: string[] = [];
      const batchSize = 3;

      for (let i = 0; i < wordsNeedingVariants.length; i += batchSize) {
        const batch = wordsNeedingVariants.slice(i, i + batchSize);
        const results = await Promise.allSettled(
          batch.map(w => fetchMotSigneVariant(w.word))
        );
        results.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            setLoadedCount(prev => prev + 1);
          } else {
            failed.push(batch[index].word);
          }
        });
        if (i + batchSize < wordsNeedingVariants.length) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      completeVariantsLoading(failed);
    } catch (error) {
      console.error('Error loading variants:', error);
      setIsLoading(false);
    }
  };

  const fetchVideoForWord = async (word: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-and-store-lsfb-video', {
        body: { word, type: 'word' }
      });
      if (error) return false;
      return !!data?.video_url;
    } catch {
      return false;
    }
  };

  const fetchMotSigneVariant = async (word: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-mot-signe-video', {
        body: { word }
      });
      if (error) return false;
      return !!data?.video_url;
    } catch {
      return false;
    }
  };

  const completeLoading = (failed: string[], successCount: number) => {
    setFailedWords(failed);
    setIsComplete(true);
    setIsLoading(false);
    
    if (failed.length === 0) {
      localStorage.setItem(STORAGE_KEY, 'true');
      localStorage.setItem('lsfb_starter_pack_count', ALL_WORDS.length.toString());
      toast({ title: "Vidéos chargées", description: `${successCount}/${totalWords} vidéos dico.lsfb.be prêtes !` });
      // Now start variants loading
      setTimeout(() => startVariantsLoading(), 2000);
    } else {
      toast({
        title: "Chargement terminé",
        description: `${successCount}/${totalWords} vidéos chargées. ${failed.length} échec(s).`,
        variant: "destructive",
      });
    }
  };

  const completeVariantsLoading = (failed: string[]) => {
    setFailedWords(failed);
    setIsComplete(true);
    setIsLoading(false);

    if (failed.length === 0) {
      localStorage.setItem(VARIANTS_STORAGE_KEY, 'true');
      toast({ title: "Variantes chargées", description: "Toutes les variantes mot-signe.be sont prêtes !" });
      setTimeout(() => setIsVisible(false), 5000);
    } else {
      toast({
        title: "Variantes chargées",
        description: `${failed.length} mot(s) sans variante sur mot-signe.be.`,
      });
      // Still mark as loaded - some words just don't exist on mot-signe
      localStorage.setItem(VARIANTS_STORAGE_KEY, 'true');
      setTimeout(() => setIsVisible(false), 5000);
    }
  };

  const retryLoading = () => {
    setIsVisible(false);
    setFailedWords([]);
    setIsComplete(false);
    setLoadedCount(0);
    if (phase === 'dico') {
      localStorage.removeItem(STORAGE_KEY);
      setTimeout(() => startLoading(), 500);
    } else {
      localStorage.removeItem(VARIANTS_STORAGE_KEY);
      setTimeout(() => startVariantsLoading(), 500);
    }
  };

  if (!isVisible) return null;

  const progress = totalWords > 0 ? (loadedCount / totalWords) * 100 : 0;

  return (
    <Card className="fixed bottom-4 right-4 w-80 p-4 shadow-lg z-50 border-2">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
          {isComplete && !isLoading && <Check className="h-4 w-4 text-green-600" />}
          <h4 className="font-semibold text-sm">
            {isLoading
              ? phase === 'dico'
                ? "Chargement dico.lsfb.be..."
                : "Chargement variantes mot-signe.be..."
              : "Vidéos chargées"}
          </h4>
        </div>
        <button onClick={() => setIsVisible(false)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{phase === 'dico' ? 'dico.lsfb.be' : 'mot-signe.be'}</span>
          <span className="font-medium">{loadedCount}/{totalWords}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {isComplete && failedWords.length > 0 && phase === 'dico' && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-destructive">
            <p className="font-medium">Mots non trouvés :</p>
            <p className="text-xs">{failedWords.slice(0, 10).join(', ')}{failedWords.length > 10 ? '...' : ''}</p>
          </div>
          <Button size="sm" variant="outline" className="w-full" onClick={retryLoading}>
            Réessayer le téléchargement
          </Button>
        </div>
      )}

      {isComplete && failedWords.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          ✓ {phase === 'dico' ? 'Vidéos dico.lsfb.be prêtes' : 'Variantes mot-signe.be prêtes'}
        </p>
      )}
    </Card>
  );
};
