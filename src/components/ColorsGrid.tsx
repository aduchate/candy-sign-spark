import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const ColorsGrid = () => {
  const words = ['rouge', 'bleu', 'jaune', 'vert', 'orange', 'rose', 'noir', 'blanc'];

  return (
    <MultiVariantWordGrid
      title="Couleurs en LSFB"
      description="Survolez une couleur pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
