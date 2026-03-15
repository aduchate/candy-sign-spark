import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const EmotionsGrid = () => {
  const words = ['content', 'triste', 'colère', 'peur', 'surpris', 'fatigué'];

  return (
    <MultiVariantWordGrid
      title="Émotions en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
