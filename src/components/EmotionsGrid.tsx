import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const EmotionsGrid = () => {
  const words = ['colère', 'content', 'fatigué', 'peur', 'surpris', 'triste'];

  return (
    <MultiVariantWordGrid
      title="Émotions en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
