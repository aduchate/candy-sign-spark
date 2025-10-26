import { useState } from "react";
import { Card } from "@/components/ui/card";

interface Letter {
  letter: string;
  gifUrl: string;
}

const AlphabetLetter = ({ letter, gifUrl }: Letter) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-glow border-2 aspect-square"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
        {isHovered && gifUrl ? (
          <img
            src={gifUrl}
            alt={`Signe de la lettre ${letter}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-6xl font-bold gradient-text">{letter}</span>
        )}
      </div>
    </Card>
  );
};

export const AlphabetGrid = () => {
  // URLs de GIFs pour chaque lettre (à remplacer par les vraies URLs)
  const alphabet: Letter[] = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({
    letter,
    // Pour l'instant, utilisez un placeholder - à remplacer avec les vraies URLs de GIFs LSFB
    gifUrl: `https://media.giphy.com/media/sign-language-${letter.toLowerCase()}/giphy.gif`
  }));


  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-3xl font-bold mb-2">Alphabet LSFB</h3>
        <p className="text-muted-foreground">
          Passez votre souris sur chaque lettre pour voir le signe animé correspondant
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
