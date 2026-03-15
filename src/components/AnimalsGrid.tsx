import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const AnimalsGrid = () => {
  const words = ['chat', 'chien', 'poisson', 'oiseau'];

  return (
    <MultiVariantWordGrid
      title="Animaux en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
