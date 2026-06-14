/**
 * The post-consultation checklist items shown to a patient (and reviewed,
 * read-only, by their healthcare provider). Labels live here so the patient
 * editor (PostConsultationFollowUp) and the pro summary (PatientFollowUpSummary)
 * stay in sync. Only the checked state is persisted, keyed by `id` in the
 * `post_consultation_checklist` table — never change an existing id.
 */
export interface PostConsultationChecklistItem {
  id: string;
  label: string;
}

export const postConsultationChecklist: PostConsultationChecklistItem[] = [
  { id: "2", label: "Comprendre le diagnostic" },
  { id: "4", label: "Savoir quand reprendre rendez-vous" },
  { id: "5", label: "Demander un récapitulatif écrit si nécessaire" },
  { id: "8", label: "Planifier le prochain suivi" },
];
