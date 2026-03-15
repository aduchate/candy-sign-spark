import { MultiVariantWordGrid, WordGroup } from "./MultiVariantWordGrid";

export const DatesGrid = () => {
  const wordGroups: WordGroup[] = [
    {
      label: "Temps",
      words: ["aujourd'hui", "demain", "hier"],
    },
    {
      label: "Jours de la semaine",
      words: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    },
    {
      label: "Mois de l'année",
      words: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    },
  ];

  return (
    <MultiVariantWordGrid
      title="Temps et dates en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      wordGroups={wordGroups}
    />
  );
};
