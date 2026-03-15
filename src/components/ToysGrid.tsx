import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const ToysGrid = () => {
  const words = ['ballon', 'courir', 'jouer', 'sauter'];

  return (
    <MultiVariantWordGrid
      title="Jeux et jouets en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
