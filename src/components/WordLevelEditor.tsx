import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, GraduationCap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface WordLevelEditorProps {
  wordId: string;
  wordText: string;
  currentLevel?: string;
}

const CECRL_LEVELS = [
  { value: 'A1', label: 'A1 - Débutant', description: 'Découverte' },
  { value: 'A2', label: 'A2 - Élémentaire', description: 'Survie' },
  { value: 'B1', label: 'B1 - Intermédiaire', description: 'Seuil' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé', description: 'Indépendant' },
  { value: 'C1', label: 'C1 - Avancé', description: 'Autonome' },
  { value: 'C2', label: 'C2 - Maîtrise', description: 'Maîtrise' },
];

export const WordLevelEditor = ({ wordId, wordText, currentLevel }: WordLevelEditorProps) => {
  const [selectedLevel, setSelectedLevel] = useState<string>(currentLevel || 'A1');
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (currentLevel) {
      setSelectedLevel(currentLevel);
    }
  }, [currentLevel]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('word_signs')
        .update({ category: selectedLevel })
        .eq('id', wordId);

      if (error) throw error;

      toast.success("Niveau mis à jour avec succès");
      setOpen(false);
    } catch (error) {
      console.error('Error saving level:', error);
      toast.error("Erreur lors de la sauvegarde du niveau");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <GraduationCap className="w-4 h-4" />
          Niveau: {currentLevel || 'A1'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Niveau CECRL pour "{wordText}"</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <Card className="p-4">
            <RadioGroup value={selectedLevel} onValueChange={setSelectedLevel}>
              <div className="space-y-3">
                {CECRL_LEVELS.map((level) => (
                  <div key={level.value} className="flex items-start space-x-3">
                    <RadioGroupItem value={level.value} id={level.value} />
                    <Label
                      htmlFor={level.value}
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="font-semibold">{level.label}</span>
                      <span className="text-xs text-muted-foreground">{level.description}</span>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Sauvegarde...
                </>
              ) : (
                "Sauvegarder"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
