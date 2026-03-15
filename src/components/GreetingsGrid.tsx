import { MultiVariantWordGrid } from "./MultiVariantWordGrid";

export const GreetingsGrid = () => {
  const words = ['au revoir', 'bonjour', 'comment', 'merci', "s'il vous plaît"];

  return (
    <MultiVariantWordGrid
      title="Salutations en LSFB"
      description="Survolez un mot pour voir sa vidéo en langue des signes."
      words={words}
    />
  );
};
