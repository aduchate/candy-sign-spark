import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Letter {
  letter: string;
  videoUrl: string;
}

// URLs réelles des vidéos LSFB depuis leur CDN
const alphabet: Letter[] = [
  { letter: "A", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48600.mp4" },
  { letter: "B", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48601.mp4" },
  { letter: "C", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48602.mp4" },
  { letter: "D", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48603.mp4" },
  { letter: "E", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48604.mp4" },
  { letter: "F", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48605.mp4" },
  { letter: "G", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48606.mp4" },
  { letter: "H", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48607.mp4" },
  { letter: "I", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48608.mp4" },
  { letter: "J", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48609.mp4" },
  { letter: "K", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48610.mp4" },
  { letter: "L", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48611.mp4" },
  { letter: "M", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48612.mp4" },
  { letter: "N", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48613.mp4" },
  { letter: "O", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48614.mp4" },
  { letter: "P", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48615.mp4" },
  { letter: "Q", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48616.mp4" },
  { letter: "R", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48617.mp4" },
  { letter: "S", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48618.mp4" },
  { letter: "T", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48619.mp4" },
  { letter: "U", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48620.mp4" },
  { letter: "V", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48621.mp4" },
  { letter: "W", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48622.mp4" },
  { letter: "X", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48623.mp4" },
  { letter: "Y", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48624.mp4" },
  { letter: "Z", videoUrl: "https://media.spreadthesign.com/video/mp4/13/48625.mp4" },
];

const AlphabetLetter = ({ letter, videoUrl }: Letter) => {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isHovered && videoRef.current) {
      videoRef.current.play().catch(err => console.log('Video play error:', err));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [isHovered]);

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
            ref={videoRef}
            src={videoUrl}
            loop
            muted
            playsInline
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
