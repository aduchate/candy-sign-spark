import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useHealthcareProviders, healthcareProviderLabel } from "@/hooks/useHealthcareProviders";

interface HealthcareProviderSelectorProps {
  userId: string;
  currentProviderId: string | null;
  /** Notifies the parent so its onboarding gate stays in sync after a change. */
  onSaved: (providerId: string) => void;
}

/** Lets a patient view and change their healthcare provider from the dashboard. */
export const HealthcareProviderSelector = ({ userId, currentProviderId, onSaved }: HealthcareProviderSelectorProps) => {
  const { providers, loading } = useHealthcareProviders();
  const [selected, setSelected] = useState<string>(currentProviderId ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selected) return;
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ healthcare_provider_id: selected })
      .eq("id", userId);
    setIsSaving(false);

    if (error) {
      console.error("Error updating healthcare provider:", error);
      toast.error("Une erreur est survenue lors de la mise à jour de votre prestataire de soins");
      return;
    }

    toast.success("Prestataire de soins mis à jour");
    onSaved(selected);
  };

  return (
    <Card className="p-6 max-w-xl space-y-4">
      <div className="space-y-1">
        <h3 className="text-xl font-bold">Mon·ma prestataire de soins</h3>
        <p className="text-sm text-muted-foreground">
          Sélectionnez le·la prestataire de soins qui vous suit.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dashboard-provider">Prestataire de soins</Label>
        {loading ? (
          <p className="text-sm text-muted-foreground">Chargement des prestataires de soins...</p>
        ) : providers.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun·e prestataire de soins n'est disponible pour le moment.
          </p>
        ) : (
          <Select value={selected} onValueChange={setSelected}>
            <SelectTrigger id="dashboard-provider">
              <SelectValue placeholder="Sélectionnez votre prestataire de soins" />
            </SelectTrigger>
            <SelectContent>
              {providers.map((provider) => (
                <SelectItem key={provider.id} value={provider.id}>
                  {healthcareProviderLabel(provider)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {providers.length > 0 && (
        <Button onClick={handleSave} disabled={isSaving || !selected || selected === currentProviderId}>
          {isSaving ? "Enregistrement..." : "Enregistrer"}
        </Button>
      )}
    </Card>
  );
};
