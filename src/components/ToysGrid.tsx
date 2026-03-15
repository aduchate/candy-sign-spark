import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const ToysGrid = () => {
  const words = ['ballon', 'jouer', 'courir', 'sauter'];

  return (
    <MultiVariantWordGrid
      title="Jeux et jouets en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes. Les mots avec plusieurs variantes sont affichés en couleur identique."
      words={words}
    />
  );
};
