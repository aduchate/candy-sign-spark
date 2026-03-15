import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const EmergencyGrid = () => {
  const words = ['urgence', 'aide', 'douleur', 'mal', 'hôpital', 'médecin', 'pompier', 'police', 'danger', 'accident'];

  return (
    <MultiVariantWordGrid
      title="Situations d'urgence en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
