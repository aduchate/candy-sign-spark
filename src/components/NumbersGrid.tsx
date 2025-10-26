import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NumberSign {
  number: string;
  videoUrl: string;
}

export const NumbersGrid = () => {
  const [numbers, setNumbers] = useState<NumberSign[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNumber, setLoadingNumber] = useState<string | null>(null);

  const numbersList = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];

  useEffect(() => {
    loadNumbersVideos();
  }, []);

  const loadNumbersVideos = async () => {
    setLoading(true);
    
    const numbersData: NumberSign[] = await Promise.all(
      numbersList.map(async (num) => {
        const { data } = await supabase
          .from("word_signs")
          .select("video_url")
          .eq("word", num)
          .maybeSingle();

        return {
          number: num,
          videoUrl: data?.video_url || "",
        };
      })
    );

    setNumbers(numbersData);
    setLoading(false);
  };

  const fetchVideoForNumber = async (number: string) => {
    setLoadingNumber(number);
    
    try {
      const { data, error } = await supabase.functions.invoke(
        "fetch-and-store-lsfb-video",
        {
          body: { word: number, type: "word" },
        }
      );

      if (error) throw error;

      if (data?.videoUrl) {
        setNumbers((prev) =>
          prev.map((n) =>
            n.number === number ? { ...n, videoUrl: data.videoUrl } : n
          )
        );
        toast.success(`Vidéo du chiffre ${number} chargée !`);
      }
    } catch (error) {
      console.error(`Error fetching video for number ${number}:`, error);
      toast.error(`Impossible de charger la vidéo du chiffre ${number}`);
    } finally {
      setLoadingNumber(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement des chiffres...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Les Chiffres en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Cliquez sur un chiffre pour voir sa vidéo en langue des signes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {numbers.map((item) => (
          <NumberCard
            key={item.number}
            number={item.number}
            videoUrl={item.videoUrl}
            onFetch={fetchVideoForNumber}
            isLoading={loadingNumber === item.number}
          />
        ))}
      </div>
    </div>
  );
};

interface NumberCardProps {
  number: string;
  videoUrl: string;
  onFetch: (number: string) => void;
  isLoading: boolean;
}

const NumberCard = ({ number, videoUrl, onFetch, isLoading }: NumberCardProps) => {
  return (
    <Card
      className="p-4 hover:shadow-candy transition-all cursor-pointer"
      onClick={() => !videoUrl && !isLoading && onFetch(number)}
    >
      <div className="aspect-square flex flex-col items-center justify-center">
        <div className="text-4xl font-bold mb-2">{number}</div>
        
        {isLoading ? (
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        ) : videoUrl ? (
          <video
            src={videoUrl}
            className="w-full h-32 object-cover rounded mt-2"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <p className="text-xs text-muted-foreground text-center mt-2">
            Cliquez pour voir
          </p>
        )}
      </div>
    </Card>
  );
};
