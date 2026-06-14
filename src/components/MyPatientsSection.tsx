import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Search, Users, ChevronRight, Loader2 } from "lucide-react";
import {
  usePatientsForProvider,
  patientLabel,
  type ProviderPatient,
} from "@/hooks/usePatientsForProvider";
import { PatientFollowUpSummary } from "@/components/PatientFollowUpSummary";
import { ConsultationSummaryUploader } from "@/components/ConsultationSummaryUploader";

interface MyPatientsSectionProps {
  providerId: string | null | undefined;
}

export const MyPatientsSection = ({ providerId }: MyPatientsSectionProps) => {
  const { patients, loading } = usePatientsForProvider(providerId);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ProviderPatient | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter((p) => patientLabel(p).toLowerCase().includes(q));
  }, [patients, search]);

  return (
    <div className="max-w-3xl">
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un patient..."
          className="pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>
            {patients.length === 0
              ? "Aucun patient ne vous a choisi comme prestataire de soins."
              : "Aucun patient ne correspond à votre recherche."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((patient) => (
            <Card
              key={patient.id}
              onClick={() => setSelected(patient)}
              className="p-4 flex items-center justify-between cursor-pointer border-2 hover:border-primary/40 transition-colors"
            >
              <div>
                <p className="font-medium">{patientLabel(patient)}</p>
                <p className="text-sm text-muted-foreground">
                  {[patient.age ? `${patient.age} ans` : null, patient.hearing_status]
                    .filter(Boolean)
                    .join(" · ") || "—"}
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </Card>
          ))}
        </div>
      )}

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          {selected && (
            <>
              <SheetHeader className="mb-6">
                <SheetTitle>{patientLabel(selected)}</SheetTitle>
                <SheetDescription>Résumé du suivi post-consultation</SheetDescription>
              </SheetHeader>
              {providerId && (
                <div className="mb-6">
                  <ConsultationSummaryUploader
                    patientId={selected.id}
                    providerId={providerId}
                  />
                </div>
              )}
              <PatientFollowUpSummary patientId={selected.id} />
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};
