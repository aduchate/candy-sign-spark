import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface HealthcareProvider {
  id: string;
  username: string | null;
  email: string | null;
}

/** Human-readable label for a provider: username, falling back to email. */
export const healthcareProviderLabel = (p: HealthcareProvider) =>
  p.username || p.email || "Prestataire sans nom";

/**
 * Fetches the list of "pro" profiles a patient can pick as their healthcare
 * provider (prestataire de soins). Emails are only reachable through the
 * `get-healthcare-providers` edge function (they live in auth.users), so we go
 * through it rather than querying profiles directly.
 */
export const useHealthcareProviders = (enabled = true) => {
  const [providers, setProviders] = useState<HealthcareProvider[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    const load = async () => {
      const { data, error } = await supabase.functions.invoke("get-healthcare-providers");
      if (!active) return;
      if (error) {
        console.error("Error fetching healthcare providers:", error);
        setProviders([]);
      } else {
        setProviders((data?.providers as HealthcareProvider[]) ?? []);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { providers, loading };
};
