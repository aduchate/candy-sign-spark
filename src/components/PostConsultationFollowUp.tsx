import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Stethoscope,
  AlertCircle,
  FileText,
  Save,
  Trash2
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Note {
  id: string;
  date: string;
  content: string;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "2", label: "Comprendre le diagnostic", checked: false },
  { id: "4", label: "Savoir quand reprendre rendez-vous", checked: false },
  { id: "5", label: "Demander un récapitulatif écrit si nécessaire", checked: false },
  { id: "8", label: "Planifier le prochain suivi", checked: false },
];

export const PostConsultationFollowUp = () => {
  const [activeTab, setActiveTab] = useState<"checklist" | "notes">("checklist");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [...prev, {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString("fr-FR"),
      content: newNote
    }]);
    setNewNote("");
  };

  const removeNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const completedCount = checklist.filter(i => i.checked).length;

  const tabs = [
    { id: "checklist" as const, label: "Liste de vérification", icon: ClipboardList },
    { id: "notes" as const, label: "Mes notes", icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-2">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <Stethoscope className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Suivi post consultation</h2>
              <p className="text-muted-foreground mt-1">
                Gardez une trace de vos consultations. Cet espace vous aide à ne rien oublier après un rendez-vous paramédical.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation onglets */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "outline"}
              onClick={() => setActiveTab(tab.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Contenu */}
      {activeTab === "checklist" && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Liste de vérification</CardTitle>
                <CardDescription>
                  Cochez chaque étape pour vous assurer que rien n'est oublié
                </CardDescription>
              </div>
              <Badge variant={completedCount === checklist.length ? "default" : "secondary"}>
                {completedCount} / {checklist.length}
              </Badge>
            </div>
            {/* Barre de progression */}
            <div className="w-full bg-muted rounded-full h-2 mt-3">
              <div
                className="bg-primary rounded-full h-2 transition-all duration-500"
                style={{ width: `${(completedCount / checklist.length) * 100}%` }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                  item.checked
                    ? "bg-primary/5 border-primary/30"
                    : "bg-card border-border hover:border-primary/30"
                }`}
              >
                <Checkbox
                  id={`check-${item.id}`}
                  checked={item.checked}
                  onCheckedChange={() => toggleCheck(item.id)}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`check-${item.id}`}
                  className={`cursor-pointer text-sm font-medium leading-relaxed ${
                    item.checked ? "line-through text-muted-foreground" : ""
                  }`}
                >
                  {item.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>
      )}


      {activeTab === "notes" && (
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Mes notes de consultation</CardTitle>
              <CardDescription>
                Gardez un carnet de vos observations et questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nouvelle note</Label>
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Notez ce que vous avez compris de la consultation, vos questions pour la prochaine fois..."
                  rows={3}
                />
                <Button onClick={addNote} className="gap-2">
                  <Save className="w-4 h-4" />
                  Ajouter la note
                </Button>
              </div>

              {notes.length > 0 && (
                <ScrollArea className="h-64">
                  <div className="space-y-3 pr-3">
                    {notes.map((note) => (
                      <Card key={note.id} className="p-4 border relative group">
                        <button
                          onClick={() => removeNote(note.id)}
                          className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <p className="text-xs text-muted-foreground mb-1">{note.date}</p>
                        <p className="text-sm leading-relaxed">{note.content}</p>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {notes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Aucune note pour le moment.</p>
                </div>
              )}
            </CardContent>
          </Card>
      )}
    </div>
  );
};
