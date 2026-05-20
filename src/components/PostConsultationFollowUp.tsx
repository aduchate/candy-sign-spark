import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  Pill,
  CalendarDays,
  ClipboardList,
  Stethoscope,
  Phone,
  AlertCircle,
  FileText,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Trash2,
  Plus
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

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const defaultChecklist: ChecklistItem[] = [
  { id: "1", label: "Ordonnance récupérée", checked: false },
  { id: "2", label: "Comprendre le diagnostic", checked: false },
  { id: "3", label: "Comprendre le traitement prescrit", checked: false },
  { id: "4", label: "Savoir quand reprendre rendez-vous", checked: false },
  { id: "5", label: "Numéro d'urgence noté", checked: false },
  { id: "6", label: "Demander un récapitulatif écrit si nécessaire", checked: false },
  { id: "7", label: "Retirer les médicaments à la pharmacie", checked: false },
  { id: "8", label: "Planifier le prochain suivi", checked: false },
];

export const PostConsultationFollowUp = () => {
  const [activeTab, setActiveTab] = useState<"checklist" | "ordonnance" | "notes" | "contacts">("checklist");
  const [checklist, setChecklist] = useState<ChecklistItem[]>(defaultChecklist);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [showNewMed, setShowNewMed] = useState(false);
  const [newMed, setNewMed] = useState({ name: "", dosage: "", frequency: "", duration: "" });

  const toggleCheck = (id: string) => {
    setChecklist(prev => prev.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    ));
  };

  const addMedication = () => {
    if (!newMed.name.trim()) return;
    setMedications(prev => [...prev, { ...newMed, id: Date.now().toString() }]);
    setNewMed({ name: "", dosage: "", frequency: "", duration: "" });
    setShowNewMed(false);
  };

  const removeMedication = (id: string) => {
    setMedications(prev => prev.filter(m => m.id !== id));
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
    { id: "ordonnance" as const, label: "Ordonnance", icon: Pill },
    { id: "notes" as const, label: "Mes notes", icon: FileText },
    { id: "contacts" as const, label: "Contacts", icon: Phone },
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
                Gardez une trace de vos consultations et de vos traitements. Cet espace vous aide à ne rien oublier après un rendez-vous médical.
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

      {activeTab === "ordonnance" && (
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Ma prescription</CardTitle>
                  <CardDescription>
                    Notez vos médicaments et leurs instructions
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowNewMed(!showNewMed)}
                  className="gap-1"
                >
                  {showNewMed ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showNewMed ? "Annuler" : "Ajouter un médicament"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showNewMed && (
                <div className="bg-muted/50 p-4 rounded-lg mb-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Nom du médicament</Label>
                      <Input
                        value={newMed.name}
                        onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                        placeholder="Ex: Paracétamol"
                      />
                    </div>
                    <div>
                      <Label>Dosage</Label>
                      <Input
                        value={newMed.dosage}
                        onChange={(e) => setNewMed({ ...newMed, dosage: e.target.value })}
                        placeholder="Ex: 500 mg"
                      />
                    </div>
                    <div>
                      <Label>Fréquence</Label>
                      <Input
                        value={newMed.frequency}
                        onChange={(e) => setNewMed({ ...newMed, frequency: e.target.value })}
                        placeholder="Ex: 3 fois par jour"
                      />
                    </div>
                    <div>
                      <Label>Durée</Label>
                      <Input
                        value={newMed.duration}
                        onChange={(e) => setNewMed({ ...newMed, duration: e.target.value })}
                        placeholder="Ex: 7 jours"
                      />
                    </div>
                  </div>
                  <Button onClick={addMedication} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    Enregistrer
                  </Button>
                </div>
              )}

              {medications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Pill className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>Aucun médicament enregistré pour le moment.</p>
                  <p className="text-sm mt-1">Cliquez sur "Ajouter un médicament" pour commencer.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {medications.map((med) => (
                    <Card key={med.id} className="p-4 border relative group">
                      <button
                        onClick={() => removeMedication(med.id)}
                        className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-muted-foreground">Médicament</p>
                          <p className="font-semibold">{med.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dosage</p>
                          <p className="font-medium">{med.dosage || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fréquence</p>
                          <p className="font-medium">{med.frequency || "—"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Durée</p>
                          <p className="font-medium">{med.duration || "—"}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 bg-accent/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Astuce LSFB</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Si vous ne comprenez pas les instructions, demandez à votre médecin de les écrire ou demandez un récapitulatif. Vous pouvez aussi demander à un interprète LSFB d'être présent lors du prochain rendez-vous.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === "notes" && (
        <div className="space-y-4">
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
        </div>
      )}

      {activeTab === "contacts" && (
        <div className="space-y-4">
          <Card className="border-2">
            <CardHeader>
              <CardTitle>Contacts utiles</CardTitle>
              <CardDescription>
                Numéros et ressources à garder à portée de main
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-semibold">Numéros d'urgence</p>
                      <p className="text-sm text-muted-foreground">112 — Appel d'urgence européen</p>
                      <p className="text-sm text-muted-foreground">101 — Pompier</p>
                      <p className="text-sm text-muted-foreground">100 — Police</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Gardes médicales</p>
                      <p className="text-sm text-muted-foreground">1733 — SOS Médecins</p>
                      <p className="text-sm text-muted-foreground">Numéro de garde de votre région</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                      <CalendarDays className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold">Service d'interprétation</p>
                      <p className="text-sm text-muted-foreground">SISB — Service d'Interprétation des Sourds de Bruxelles</p>
                      <p className="text-sm text-muted-foreground">www.infosourds.be</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 border">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold">Votre médecin traitant</p>
                      <p className="text-sm text-muted-foreground">Nom : _______________</p>
                      <p className="text-sm text-muted-foreground">Téléphone : _______________</p>
                      <p className="text-sm text-muted-foreground">Email : _______________</p>
                    </div>
                  </div>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
