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

  // Liste des mots courants du dictionnaire LSFB
  const commonWords = [
    { word: "bonjour", url: "http://dico.lsfb.be/?p=1287" },
    { word: "merci", url: "http://dico.lsfb.be/?p=5481" },
    { word: "s'il vous plaît", url: "http://dico.lsfb.be/?p=7677" },
    { word: "oui", url: "http://dico.lsfb.be/?p=5782" },
    { word: "non", url: "http://dico.lsfb.be/?p=5649" },
    { word: "famille", url: "http://dico.lsfb.be/?p=3267" },
    { word: "manger", url: "http://dico.lsfb.be/?p=5288" },
    { word: "boire", url: "http://dico.lsfb.be/?p=1192" },
    { word: "dormir", url: "http://dico.lsfb.be/?p=2730" },
    { word: "travailler", url: "http://dico.lsfb.be/?p=9188" },
    { word: "école", url: "http://dico.lsfb.be/?p=2800" },
    { word: "hôpital", url: "http://dico.lsfb.be/?p=4214" },
    { word: "maison", url: "http://dico.lsfb.be/?p=5243" },
  ];

  const fetchSign = async (signUrl: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('fetch-lsfb-sign', {
        body: { signUrl }
      });

      if (error) throw error;

      if (data?.success && data?.data) {
        return data.data as LSFBSign;
      }
      return null;
    } catch (error) {
      console.error('Error fetching sign:', error);
      return null;
    }
  };

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

      // Récupérer les données pour chaque mot trouvé
      const signPromises = matchingWords.map(w => fetchSign(w.url));
      const fetchedSigns = await Promise.all(signPromises);
      
      const validSigns = fetchedSigns.filter((s): s is LSFBSign => s !== null);
      
      if (validSigns.length > 0) {
        setSigns(validSigns);
        toast.success(`${validSigns.length} signe(s) trouvé(s)`);
      } else {
        toast.error("Impossible de récupérer les signes");
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
              <h4 className="font-bold text-lg mb-2">{sign.title}</h4>
              {sign.videoUrl && (
                <div className="aspect-video bg-muted rounded-md overflow-hidden mb-2">
                  <video
                    src={sign.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              {sign.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {sign.description}
                </p>
              )}
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
