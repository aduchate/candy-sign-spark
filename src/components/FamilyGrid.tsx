import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const FamilyGrid = () => {
  const words = ['bébé', 'famille', 'frère', 'maman', 'papa', 'soeur'];

  return (
    <MultiVariantWordGrid
      title="Famille en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
