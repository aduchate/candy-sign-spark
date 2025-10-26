import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface LevelTabsProps {
  selected: "A1" | "A2" | "B1" | "B2";
  onSelect: (level: "A1" | "A2" | "B1" | "B2") => void;
}

const levelDescriptions = {
  A1: "Débutant",
  A2: "Élémentaire",
  B1: "Intermédiaire",
  B2: "Avancé",
};

export const LevelTabs = ({ selected, onSelect }: LevelTabsProps) => {
  return (
    <Tabs value={selected} onValueChange={(value) => onSelect(value as "A1" | "A2" | "B1" | "B2")} className="w-full mb-6">
      <TabsList className="grid w-full grid-cols-4">
        {(["A1", "A2", "B1", "B2"] as const).map((level) => (
          <TabsTrigger key={level} value={level} className="flex flex-col gap-1">
            <span className="font-bold">{level}</span>
            <span className="text-xs">{levelDescriptions[level]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
