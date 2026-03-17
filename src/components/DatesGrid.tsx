import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchVideoUrlsForWord } from "@/lib/wordSignsQuery";
import { MultiVideoPlayer } from "@/components/MultiVideoPlayer";

interface DateWord {
  word: string;
  videoUrls: string[];
}

export const DatesGrid = () => {
  const [timeWords, setTimeWords] = useState<DateWord[]>([]);
  const [dayWords, setDayWords] = useState<DateWord[]>([]);
  const [monthWords, setMonthWords] = useState<DateWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredWord, setHoveredWord] = useState<string | null>(null);

  const timeVocab = ['aujourd\'hui', 'demain', 'hier'];
  const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];

  useEffect(() => {
    loadDatesVideos();
  }, []);

  const loadDatesVideos = async () => {
    setLoading(true);
    
    const [timeData, dayData, monthData] = await Promise.all([
      loadWords(timeVocab),
      loadWords(days),
      loadWords(months)
    ]);

    setTimeWords(timeData);
    setDayWords(dayData);
    setMonthWords(monthData);
    setLoading(false);
  };

  const loadWords = async (words: string[]): Promise<DateWord[]> => {
    return Promise.all(
      words.map(async (word) => {
        const videoUrls = await fetchVideoUrlsForWord(word);
        return { word, videoUrls };
      })
    );
  };

  const WordCard = ({ item }: { item: DateWord }) => (
    <Card
      className="p-4 hover:shadow-glow transition-all cursor-pointer relative aspect-square"
      onMouseEnter={() => setHoveredWord(item.word)}
      onMouseLeave={() => setHoveredWord(null)}
    >
      <div className="h-full flex flex-col items-center justify-center">
        {hoveredWord === item.word && item.videoUrls.length > 0 ? (
          <MultiVideoPlayer
            videoUrls={item.videoUrls}
            className="w-full h-full object-contain rounded"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <>
            <div className="text-lg font-bold text-center capitalize">{item.word}</div>
            {item.videoUrls.length === 0 && (
              <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />
            )}
          </>
        )}
      </div>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Chargement du temps et des dates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold mb-4">Temps et Dates en LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Survolez un mot pour voir sa vidéo en langue des signes.
        </p>
      </div>

      <Tabs defaultValue="time" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="time">Temps</TabsTrigger>
          <TabsTrigger value="days">Jours</TabsTrigger>
          <TabsTrigger value="months">Mois</TabsTrigger>
        </TabsList>
        
        <TabsContent value="time" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {timeWords.map((item) => (
              <WordCard key={item.word} item={item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="days" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {dayWords.map((item) => (
              <WordCard key={item.word} item={item} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="months" className="mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {monthWords.map((item) => (
              <WordCard key={item.word} item={item} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
