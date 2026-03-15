import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const ColorsGrid = () => {
  const words = ['blanc', 'bleu', 'jaune', 'noir', 'orange', 'rose', 'rouge', 'vert'];

  return (
    <MultiVariantWordGrid
      title="Couleurs en LSFB"
      description="Survolez une couleur pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
