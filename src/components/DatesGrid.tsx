import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const DatesGrid = () => {
  const words = [
    "aujourd'hui", 'demain', 'hier',
    'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche',
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];

  return (
    <MultiVariantWordGrid
      title="Temps et dates en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
