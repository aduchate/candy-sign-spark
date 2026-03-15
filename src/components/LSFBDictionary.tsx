import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";
import { WordCategoryEditor } from "./WordCategoryEditor";
import { WordLevelEditor } from "./WordLevelEditor";
import { Badge } from "@/components/ui/badge";

interface LSFBSign {
  id?: string;
  title: string;
  videoUrl: string | null;
  description: string;
  sourceUrl: string;
  level?: string;
  variants?: { video_url: string; source: string; tags: string[] }[];
}

export const LSFBDictionary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [signs, setSigns] = useState<LSFBSign[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSign, setSelectedSign] = useState<LSFBSign | null>(null);

  // Liste des mots courants avec leurs vidéos LSFB (vidéos de démonstration)
  const commonWords = [
    { word: "bonjour", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", description: "Salutation du matin et de la journée" },
    { word: "merci", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", description: "Expression de gratitude" },
    { word: "oui", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", description: "Affirmation positive" },
    { word: "non", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", description: "Négation" },
    { word: "famille", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4", description: "Groupe de personnes apparentées" },
    { word: "manger", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4", description: "Action de se nourrir" },
    { word: "boire", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4", description: "Action de consommer un liquide" },
    { word: "dormir", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", description: "État de repos et de sommeil" },
    { word: "travailler", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4", description: "Exercer une activité professionnelle" },
    { word: "école", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4", description: "Établissement d'enseignement" },
    { word: "maison", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4", description: "Lieu d'habitation" },
    { word: "ami", videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4", description: "Personne avec qui on a des liens d'amitié" },
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error("Veuillez entrer un mot à rechercher");
      return;
    }

    setIsLoading(true);
    setSigns([]);
    setSelectedSign(null);

    try {
      // Check if video already exists in database
      const { data: existingData } = await supabase
        .from('word_signs')
        .select('id, word, video_url, source_url, signed_grammar, category')
        .ilike('word', searchTerm.trim())
        .single();

      if (existingData) {
        // Load variants
        let variants: { video_url: string; source: string; tags: string[] }[] = [];
        const { data: variantData } = await supabase
          .from('word_sign_variants')
          .select('video_url, source, tags')
          .eq('word_sign_id', existingData.id);
        if (variantData) {
          variants = variantData.map(v => ({
            video_url: v.video_url,
            source: v.source,
            tags: v.tags || [],
          }));
        }

        const foundSigns: LSFBSign[] = [{
          id: existingData.id,
          title: existingData.word.charAt(0).toUpperCase() + existingData.word.slice(1),
          videoUrl: existingData.video_url,
          description: existingData.signed_grammar || `Signe pour "${existingData.word}" en LSFB`,
          sourceUrl: existingData.source_url || "https://dico.lsfb.be/",
          level: existingData.category,
          variants,
        }];
        setSigns(foundSigns);
        toast.success(`Signe trouvé${variants.length > 0 ? ` + ${variants.length} variante(s)` : ''}`);
        setIsLoading(false);
        return;
      }

      // If not in database, fetch from dico.lsfb.be
      const { data, error } = await supabase.functions.invoke('fetch-and-store-lsfb-video', {
        body: { word: searchTerm.trim(), type: 'word' }
      });

      if (error) throw error;

      if (data?.success && data?.video_url) {
        const foundSigns: LSFBSign[] = [{
          title: searchTerm.trim().charAt(0).toUpperCase() + searchTerm.trim().slice(1),
          videoUrl: data.video_url,
          description: data.description || `Signe pour "${searchTerm}" en LSFB`,
          sourceUrl: data.source_url || "https://dico.lsfb.be/",
        }];
        setSigns(foundSigns);
        toast.success("Vidéo trouvée et stockée avec succès");
      } else {
        toast.error("Aucun signe trouvé pour ce mot");
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Erreur lors de la recherche");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-4">Dictionnaire LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Recherchez des mots en français pour voir leur signe en LSFB
        </p>
        
        <div className="flex gap-3">
          <Input
            placeholder="Rechercher un mot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button 
            onClick={handleSearch} 
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Rechercher
          </Button>
        </div>

        {/* Suggestions de mots courants */}
        <div className="mt-4">
          <p className="text-sm text-muted-foreground mb-2">Mots courants :</p>
          <div className="flex flex-wrap gap-2">
            {commonWords.map((word) => (
              <Button
                key={word.word}
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm(word.word);
                }}
                className="text-xs"
              >
                {word.word}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Résultats de recherche */}
      {signs.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signs.map((sign, index) => (
            <Card
              key={index}
              className="p-4 cursor-pointer hover:shadow-glow transition-all duration-300 border-2"
              onClick={() => setSelectedSign(sign)}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-bold text-lg">{sign.title}</h4>
                {sign.id && (
                  <div className="flex gap-2">
                    <WordLevelEditor wordId={sign.id} wordText={sign.title} currentLevel={sign.level} />
                    <WordCategoryEditor wordId={sign.id} wordText={sign.title} />
                  </div>
                )}
              </div>
              {sign.videoUrl && (
                <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                  <video
                    src={sign.videoUrl}
                    controls
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {sign.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sign.description}
                </p>
              )}
              <div className="flex items-center gap-1 mt-2">
                <Badge variant="outline" className="text-[10px]">dico.lsfb.be</Badge>
                {sign.variants && sign.variants.map((v, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{v.source}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Détails du signe sélectionné */}
      {selectedSign && (
        <Card className="p-6 border-2 border-primary">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-2xl font-bold">{selectedSign.title}</h3>
            {selectedSign.id && (
              <div className="flex gap-2">
                <WordLevelEditor wordId={selectedSign.id} wordText={selectedSign.title} currentLevel={selectedSign.level} />
                <WordCategoryEditor wordId={selectedSign.id} wordText={selectedSign.title} />
              </div>
            )}
          </div>

          {/* Main video from dico.lsfb.be */}
          {selectedSign.videoUrl && (
            <div className="space-y-2 mb-4">
              <Badge variant="outline" className="text-xs">dico.lsfb.be</Badge>
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <video
                  src={selectedSign.videoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Variant videos from mot-signe.be */}
          {selectedSign.variants && selectedSign.variants.length > 0 && (
            <div className="space-y-3 mb-4">
              <h4 className="font-semibold text-sm text-muted-foreground">Variantes</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedSign.variants.map((variant, i) => (
                  <div key={i} className="space-y-1">
                    <Badge variant="secondary" className="text-xs">{variant.source}</Badge>
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      <video
                        src={variant.video_url}
                        controls
                        loop
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {variant.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {variant.tags.map((tag, j) => (
                          <Badge key={j} variant="outline" className="text-[10px]">{tag}</Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedSign.description && (
            <p className="text-muted-foreground mb-4">{selectedSign.description}</p>
          )}
          <a
            href={selectedSign.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Voir sur le site LSFB →
          </a>
        </Card>
      )}
    </div>
  );
};
