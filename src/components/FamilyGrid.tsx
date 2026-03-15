import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const FamilyGrid = () => {
  const words = ['maman', 'papa', 'frère', 'soeur', 'bébé', 'famille'];

  return (
    <MultiVariantWordGrid
      title="Famille en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
