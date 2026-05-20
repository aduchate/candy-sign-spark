import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UF_DESCRIPTIONS } from "@/lib/levelLabels";

interface LevelTabsProps {
  selected: "A1" | "A2" | "B1" | "B2";
  onSelect: (level: "A1" | "A2" | "B1" | "B2") => void;
}

export const LevelTabs = ({ selected, onSelect }: LevelTabsProps) => {
  return (
    <Tabs value={selected} onValueChange={(value) => onSelect(value as "A1" | "A2" | "B1" | "B2")} className="w-full mb-6">
      <TabsList className="grid w-full grid-cols-4">
        {(["A1", "A2", "B1", "B2"] as const).map((level) => (
          <TabsTrigger key={level} value={level} className="flex flex-col gap-1">
            <span className="font-bold">{level}</span>
            <span className="text-xs">{UF_DESCRIPTIONS[level]}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
};
