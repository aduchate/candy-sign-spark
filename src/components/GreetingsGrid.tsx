import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const GreetingsGrid = () => {
  const words = ['Bonjour', 'Merci', 'Au revoir', 'S\'il vous plaît', 'comment', 'allez', 'vous'];

  return (
    <MultiVariantWordGrid
      title="Salutations en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes de signe sont affichés en couleur identique."
      words={words}
    />
  );
};
