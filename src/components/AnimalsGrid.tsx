import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const AnimalsGrid = () => {
  const words = ['chat', 'chien', 'oiseau', 'poisson'];

  return (
    <MultiVariantWordGrid
      title="Animaux en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
