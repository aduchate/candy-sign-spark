import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ProviderPatient {
  id: string;
  username: string | null;
  age: number | null;
  hearing_status: string | null;
}

/** Human-readable label for a patient: username, falling back to a short id. */
export const patientLabel = (p: ProviderPatient) =>
  p.username || `Patient ${p.id.slice(0, 8)}`;

/**
 * Lists the patients who picked the given pro as their healthcare provider
 * (profiles.healthcare_provider_id = providerId). Pass `null`/undefined to stay
 * idle until the provider id is known.
 */
export const usePatientsForProvider = (providerId: string | null | undefined) => {
  const [patients, setPatients] = useState<ProviderPatient[]>([]);
  const [loading, setLoading] = useState(!!providerId);

  useEffect(() => {
    if (!providerId) {
      setPatients([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);

    const load = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, age, hearing_status")
        .eq("account_type", "patient")
        .eq("healthcare_provider_id", providerId)
        .order("username", { ascending: true });

      if (!active) return;
      if (error) {
        console.error("Error fetching patients:", error);
        setPatients([]);
      } else {
        setPatients((data as ProviderPatient[]) ?? []);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [providerId]);

  return { patients, loading };
};
