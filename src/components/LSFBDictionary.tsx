import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Search } from "lucide-react";

interface LSFBSign {
  title: string;
  videoUrl: string | null;
  description: string;
  sourceUrl: string;
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
      // Rechercher dans les mots courants
      const matchingWords = commonWords.filter(w => 
        w.word.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchingWords.length === 0) {
        toast.error("Aucun signe trouvé pour ce mot");
        setIsLoading(false);
        return;
      }

      // Créer les objets de signes directement depuis les données
      const foundSigns: LSFBSign[] = matchingWords.map(w => ({
        title: w.word.charAt(0).toUpperCase() + w.word.slice(1),
        videoUrl: w.videoUrl,
        description: w.description,
        sourceUrl: "https://dico.lsfb.be/"
      }));
      
      setSigns(foundSigns);
      toast.success(`${foundSigns.length} signe(s) trouvé(s)`);
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
              <h4 className="font-bold text-lg mb-2">{sign.title}</h4>
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
              <p className="text-xs text-muted-foreground mt-2">
                📹 Vidéo de démonstration
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Détails du signe sélectionné */}
      {selectedSign && (
        <Card className="p-6 border-2 border-primary">
          <h3 className="text-2xl font-bold mb-4">{selectedSign.title}</h3>
          {selectedSign.videoUrl && (
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-4">
              <video
                src={selectedSign.videoUrl}
                controls
                autoPlay
                loop
                className="w-full h-full object-cover"
              />
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
