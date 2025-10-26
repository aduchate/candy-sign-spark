import { Users, Baby } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProfileSelectorProps {
  selected: "enfant" | "adulte";
  onSelect: (profile: "enfant" | "adulte") => void;
}

export const ProfileSelector = ({ selected, onSelect }: ProfileSelectorProps) => {
  return (
    <div className="flex gap-4 mb-6">
      <Button
        variant={selected === "adulte" ? "default" : "outline"}
        onClick={() => onSelect("adulte")}
        className="flex-1 h-20 text-lg"
      >
        <Users className="mr-2 h-6 w-6" />
        Adulte
      </Button>
      <Button
        variant={selected === "enfant" ? "default" : "outline"}
        onClick={() => onSelect("enfant")}
        className="flex-1 h-20 text-lg"
      >
        <Baby className="mr-2 h-6 w-6" />
        Enfant
      </Button>
    </div>
  );
};
