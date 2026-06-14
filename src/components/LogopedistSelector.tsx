import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useLogopedists, logopedistLabel } from "@/hooks/useLogopedists";

interface LogopedistSelectorProps {
  userId: string;
  currentLogopedistId: string | null;
  /** Notifies the parent so its onboarding gate stays in sync after a change. */
  onSaved: (logopedistId: string) => void;
}

/** Lets a patient view and change their logopedist from the dashboard. */
export const LogopedistSelector = ({ userId, currentLogopedistId, onSaved }: LogopedistSelectorProps) => {
  const { logopedists, loading } = useLogopedists();
  const [selected, setSelected] = useState<string>(currentLogopedistId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ logopedist_id: selected })
      .eq("id", userId);
    setIsSaving(false);

    if (error) {
      console.error("Error updating logopedist:", error);
      toast.error("Une erreur est survenue lors de la mise à jour de votre logopède");
      return;
    }

    toast.success("Logopède mis à jour");
    onSaved(selected);
  };

  return (
    <Card className="p-6 max-w-xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold">Mon·ma logopède</h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le·la professionnel·le qui vous suit.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dashboard-logopedist">Logopède</Label>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement des logopèdes...</p>
        ) : logopedists.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun·e logopède n'est disponible pour le moment.
          </p>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger id="dashboard-logopedist">
              <SelectValue placeholder="Sélectionnez votre logopède" />
            </SelectTrigger>
            <SelectContent>
              {logopedists.map((logopedist) => (
                <SelectItem key={logopedist.id} value={logopedist.id}>
                  {logopedistLabel(logopedist)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {logopedists.length > 0 && (
        <Button onClick={handleSave} disabled={isSaving || !selected || selected === currentLogopedistId}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      )}
    </Card>
  );
};
