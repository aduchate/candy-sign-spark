import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ClipboardList, FileText, Loader2 } from "lucide-react";
import { postConsultationChecklist } from "@/lib/postConsultationChecklist";
import { usePostConsultationData } from "@/hooks/usePostConsultationData";

interface PatientFollowUpSummaryProps {
  patientId: string;
}

/**
 * Read-only view of a patient's post-consultation follow-up (checklist progress
 * + feedback notes), shown to their healthcare provider. The pro has no write
 * path: RLS allows SELECT only, and this component renders no edit controls.
 */
export const PatientFollowUpSummary = ({ patientId }: PatientFollowUpSummaryProps) => {
  const { checkedIds, notes, loading } = usePostConsultationData(patientId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
    );
  }

  const totalCount = postConsultationChecklist.length;
  const completedCount = postConsultationChecklist.filter((i) => checkedIds.has(i.id)).length;

  return (
    <div className="space-y-6">
      {/* Checklist */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <ClipboardList className="w-4 h-4" />
                Liste de vérification
              </CardTitle>
              <CardDescription>Retour post-consultation du patient</CardDescription>
            </div>
            <Badge variant={completedCount === totalCount ? "default" : "secondary"}>
              {completedCount} / {totalCount}
            </Badge>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-3">
            <div
              className="bg-primary rounded-full h-2 transition-all duration-500"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {postConsultationChecklist.map((item) => {
            const checked = checkedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  checked ? "bg-primary/5 border-primary/30" : "bg-card border-border"
                }`}
              >
                <Checkbox checked={checked} disabled className="mt-0.5" />
                <Label
                  className={`text-sm font-medium leading-relaxed ${
                    checked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.label}
                </Label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Feedback notes */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4" />
            Notes du patient
          </CardTitle>
          <CardDescription>Observations et questions notées par le patient</CardDescription>
        </CardHeader>
        <CardContent>
          {notes.length > 0 ? (
            <ScrollArea className="h-64">
              <div className="space-y-3 pr-3">
                {notes.map((note) => (
                  <Card key={note.id} className="p-4 border">
                    <p className="text-xs text-muted-foreground mb-1">
                      {new Date(note.created_at).toLocaleDateString("fr-FR")}
                    </p>
                    <p className="text-sm leading-relaxed">{note.content}</p>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p>Aucune note pour le moment.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
