import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Letter {
  letter: string;
  videoUrl: string;
}

const alphabet: Letter[] = [
  { letter: "A", videoUrl: "https://dico.lsfb.be/videos/alphabet/a.mp4" },
  { letter: "B", videoUrl: "https://dico.lsfb.be/videos/alphabet/b.mp4" },
  { letter: "C", videoUrl: "https://dico.lsfb.be/videos/alphabet/c.mp4" },
  { letter: "D", videoUrl: "https://dico.lsfb.be/videos/alphabet/d.mp4" },
  { letter: "E", videoUrl: "https://dico.lsfb.be/videos/alphabet/e.mp4" },
  { letter: "F", videoUrl: "https://dico.lsfb.be/videos/alphabet/f.mp4" },
  { letter: "G", videoUrl: "https://dico.lsfb.be/videos/alphabet/g.mp4" },
  { letter: "H", videoUrl: "https://dico.lsfb.be/videos/alphabet/h.mp4" },
  { letter: "I", videoUrl: "https://dico.lsfb.be/videos/alphabet/i.mp4" },
  { letter: "J", videoUrl: "https://dico.lsfb.be/videos/alphabet/j.mp4" },
  { letter: "K", videoUrl: "https://dico.lsfb.be/videos/alphabet/k.mp4" },
  { letter: "L", videoUrl: "https://dico.lsfb.be/videos/alphabet/l.mp4" },
  { letter: "M", videoUrl: "https://dico.lsfb.be/videos/alphabet/m.mp4" },
  { letter: "N", videoUrl: "https://dico.lsfb.be/videos/alphabet/n.mp4" },
  { letter: "O", videoUrl: "https://dico.lsfb.be/videos/alphabet/o.mp4" },
  { letter: "P", videoUrl: "https://dico.lsfb.be/videos/alphabet/p.mp4" },
  { letter: "Q", videoUrl: "https://dico.lsfb.be/videos/alphabet/q.mp4" },
  { letter: "R", videoUrl: "https://dico.lsfb.be/videos/alphabet/r.mp4" },
  { letter: "S", videoUrl: "https://dico.lsfb.be/videos/alphabet/s.mp4" },
  { letter: "T", videoUrl: "https://dico.lsfb.be/videos/alphabet/t.mp4" },
  { letter: "U", videoUrl: "https://dico.lsfb.be/videos/alphabet/u.mp4" },
  { letter: "V", videoUrl: "https://dico.lsfb.be/videos/alphabet/v.mp4" },
  { letter: "W", videoUrl: "https://dico.lsfb.be/videos/alphabet/w.mp4" },
  { letter: "X", videoUrl: "https://dico.lsfb.be/videos/alphabet/x.mp4" },
  { letter: "Y", videoUrl: "https://dico.lsfb.be/videos/alphabet/y.mp4" },
  { letter: "Z", videoUrl: "https://dico.lsfb.be/videos/alphabet/z.mp4" },
];

const AlphabetLetter = ({ letter, videoUrl }: Letter) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        {!isHovered ? (
          <span className="text-6xl font-bold gradient-text">{letter}</span>
        ) : (
          <video
            src={videoUrl}
            autoPlay
            loop
            muted
            className="w-full h-full object-cover"
          />
        )}
      </div>
    </Card>
  );
};

export const AlphabetGrid = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Alphabet LSFB</h3>
        <p className="text-muted-foreground">
          Passez votre souris sur chaque lettre pour voir le signe correspondant
        </p>
      </div>
      
      <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
        {alphabet.map((item) => (
          <AlphabetLetter key={item.letter} {...item} />
        ))}
      </div>
    </div>
  );
};
