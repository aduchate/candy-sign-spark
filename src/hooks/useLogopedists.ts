import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Logopedist {
  id: string;
  username: string | null;
  email: string | null;
}

/** Human-readable label for a logopedist: username, falling back to email. */
export const logopedistLabel = (l: Logopedist) =>
  l.username || l.email || "Professionnel·le sans nom";

/**
 * Fetches the list of "pro" profiles a patient can pick as their logopedist.
 * Emails are only reachable through the `get-logopedists` edge function (they
 * live in auth.users), so we go through it rather than querying profiles directly.
 */
export const useLogopedists = (enabled = true) => {
  const [logopedists, setLogopedists] = useState<Logopedist[]>([]);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) return;
    let active = true;

    const load = async () => {
      const { data, error } = await supabase.functions.invoke("get-logopedists");
      if (!active) return;
      if (error) {
        console.error("Error fetching logopedists:", error);
        setLogopedists([]);
      } else {
        setLogopedists((data?.logopedists as Logopedist[]) ?? []);
      }
      setLoading(false);
    };

    load();
    return () => {
      active = false;
    };
  }, [enabled]);

  return { logopedists, loading };
};
