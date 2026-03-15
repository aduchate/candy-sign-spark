import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const WorkVocabGrid = () => {
  const words = ['travail', 'bureau', 'réunion', 'collègue', 'directeur', 'projet', 'email'];

  return (
    <MultiVariantWordGrid
      title="Vocabulaire professionnel en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
