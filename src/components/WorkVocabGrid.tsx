import { MultiVariantWordGrid, WordGroup } from "./MultiVariantWordGrid";

export const WorkVocabGrid = () => {
  const wordGroups: WordGroup[] = [
    {
      label: "Personnes",
      words: ["collègue", "directeur"],
    },
    {
      label: "Lieux et outils",
      words: ["bureau", "email"],
    },
    {
      label: "Activités",
      words: ["travail", "réunion", "projet"],
    },
  ];

  return (
    <MultiVariantWordGrid
      title="Vocabulaire professionnel en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      wordGroups={wordGroups}
    />
  );
};
