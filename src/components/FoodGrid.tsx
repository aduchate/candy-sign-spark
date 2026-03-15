import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const FoodGrid = () => {
  const words = ['pomme', 'banane', 'pain', 'eau', 'lait', 'chocolat'];

  return (
    <MultiVariantWordGrid
      title="Nourriture en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
