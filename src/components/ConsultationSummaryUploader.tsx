import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, Trash2, Video } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Summary {
  id: string;
  video_url: string;
  note: string | null;
  created_at: string;
}

interface Props {
  patientId: string;
  providerId: string;
}

export const ConsultationSummaryUploader = ({ patientId, providerId }: Props) => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("consultation_summaries")
      .select("id, video_url, note, created_at")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setSummaries((data as Summary[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (!f.type.startsWith("video/")) {
      toast({ title: "Format invalide", description: "Veuillez déposer un fichier vidéo.", variant: "destructive" });
      return;
    }
    setFile(f);
  };

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `consultation-summaries/${providerId}/${patientId}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("lsfb-videos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("lsfb-videos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("consultation_summaries").insert({
        patient_id: patientId,
        provider_id: providerId,
        video_url: pub.publicUrl,
        note: note.trim() || null,
      });
      if (insErr) throw insErr;
      toast({ title: "Résumé envoyé", description: "La vidéo est disponible pour le patient." });
      setFile(null);
      setNote("");
      if (inputRef.current) inputRef.current.value = "";
      load();
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erreur", description: e.message ?? "Envoi impossible", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const remove = async (s: Summary) => {
    const { error } = await supabase.from("consultation_summaries").delete().eq("id", s.id);
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }
    // best-effort cleanup of storage object
    const marker = "/lsfb-videos/";
    const idx = s.video_url.indexOf(marker);
    if (idx >= 0) {
      const path = s.video_url.slice(idx + marker.length);
      await supabase.storage.from("lsfb-videos").remove([path]);
    }
    load();
  };

  return (
    <Card className="p-4 border-2 space-y-4">
      <div className="flex items-center gap-2">
        <Video className="w-4 h-4" />
        <h3 className="text-base font-semibold">Résumé de consultation en LSFB</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Déposez une vidéo signée résumant la consultation. Le patient pourra la revoir à tout moment.
      </p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
        }`}
      >
        <Upload className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
        {file ? (
          <p className="text-sm font-medium">{file.name}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Glissez une vidéo ici, ou cliquez pour parcourir
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm">Note (optionnelle)</Label>
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Quelques mots accompagnant la vidéo..."
        />
      </div>

      <Button onClick={upload} disabled={!file || uploading} className="gap-2 w-full">
        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Envoyer le résumé
      </Button>

      <div className="pt-2 border-t space-y-3">
        <p className="text-sm font-medium">Résumés envoyés</p>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : summaries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun résumé envoyé pour ce patient.</p>
        ) : (
          summaries.map((s) => (
            <Card key={s.id} className="p-3 space-y-2 border">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(s.created_at).toLocaleString("fr-FR")}
                </p>
                <button
                  onClick={() => remove(s)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <video src={s.video_url} controls className="w-full rounded-md bg-black" />
              {s.note && <p className="text-sm leading-relaxed">{s.note}</p>}
            </Card>
          ))
        )}
      </div>
    </Card>
  );
};
