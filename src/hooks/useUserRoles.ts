import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Fetches the current user's roles once and exposes derived flags.
 * Returns an empty role list when logged out (e.g. offline mode).
 */
export function useUserRoles() {
  const query = useQuery({
    queryKey: ["user-roles"],
    queryFn: async (): Promise<AppRole[]> => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      if (error) throw error;

      return (data ?? []).map((r) => r.role);
    },
  });

  const roles = query.data ?? [];

  return {
    roles,
    isLoadingRoles: query.isLoading,
    isAdmin: roles.includes("admin"),
    isPro: roles.includes("pro"),
    isPatient: roles.includes("patient"),
    hasAccountType: roles.includes("pro") || roles.includes("patient"),
  };
}
