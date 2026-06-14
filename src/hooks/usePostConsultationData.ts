import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PostConsultationNote {
  id: string;
  content: string;
  created_at: string;
}

/**
 * Loads a patient's post-consultation follow-up: the set of checked checklist
 * item ids and their feedback notes. Works for the patient themselves and, via
 * RLS, for the pro they chose as healthcare provider (read-only).
 *
 * Pass `null` for userId (e.g. before auth resolves) to stay idle. Follows the
 * app's direct-supabase, useState/useEffect convention (no react-query).
 */
export const usePostConsultationData = (userId: string | null) => {
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState<PostConsultationNote[]>([]);
  const [loading, setLoading] = useState(!!userId);

  const load = useCallback(async () => {
    if (!userId) {
      setCheckedIds(new Set());
      setNotes([]);
      setLoading(false);
      return;
    }
    setLoading(true);

    const [checklistRes, notesRes] = await Promise.all([
      supabase
        .from("post_consultation_checklist")
        .select("item_id")
        .eq("user_id", userId)
        .eq("checked", true),
      supabase
        .from("post_consultation_notes")
        .select("id, content, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
    ]);

    if (checklistRes.error) {
      console.error("Error fetching checklist:", checklistRes.error);
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set((checklistRes.data ?? []).map((r) => r.item_id)));
    }

    if (notesRes.error) {
      console.error("Error fetching notes:", notesRes.error);
      setNotes([]);
    } else {
      setNotes(notesRes.data ?? []);
    }

    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  return { checkedIds, notes, loading, refetch: load };
};
