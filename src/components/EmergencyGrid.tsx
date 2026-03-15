import { MultiVariantWordGrid, WordGroup } from "./MultiVariantWordGrid";

export const EmergencyGrid = () => {
  const wordGroups: WordGroup[] = [
    {
      label: "Services d'urgence",
      words: ["pompier", "police", "médecin", "hôpital"],
    },
    {
      label: "Situations",
      words: ["urgence", "danger", "accident", "aide"],
    },
    {
      label: "Santé",
      words: ["douleur", "mal"],
    },
  ];

  return (
    <MultiVariantWordGrid
      title="Situations d'urgence en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      wordGroups={wordGroups}
    />
  );
};
