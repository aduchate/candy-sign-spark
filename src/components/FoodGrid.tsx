import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const FoodGrid = () => {
  const words = ['banane', 'chocolat', 'eau', 'lait', 'pain', 'pomme'];

  return (
    <MultiVariantWordGrid
      title="Nourriture en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
