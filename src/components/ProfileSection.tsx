import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User as UserIcon, History, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { User } from "@supabase/supabase-js";

interface ProfileData {
  username: string | null;
  age: number | null;
  status: string | null;
  hearing_status: string | null;
  profession: string | null;
  installation_reason: string | null;
  onboarding_completed: boolean | null;
  preferred_age_group: string | null;
}

interface HistoryEntry {
  section: string;
  label: string;
  timestamp: string;
}

const SECTION_LABELS: Record<string, string> = {
  apprentissage: "Apprentissage",
  glossaire: "Glossaire Paramédical",
  starterpack: "Starter Pack",
  rendezvous: "Prise de rendez-vous",
  hopitaux: "Plans hôpitaux",
  dons: "Dons pour votre cause",
  liens: "Liens utiles",
  actualites: "Actualités",
  emploi: "Aide à l'Emploi",
  administration: "Administration",
  projets: "Projets",
  formations: "Formations",
  evenements: "Événements",
  profil: "Profil",
};

export const addHistoryEntry = (section: string) => {
  if (section === "profil") return;
  const label = SECTION_LABELS[section] || section;
  const entry: HistoryEntry = {
    section,
    label,
    timestamp: new Date().toISOString(),
  };
  const stored = localStorage.getItem("navigation_history");
  const history: HistoryEntry[] = stored ? JSON.parse(stored) : [];
  history.unshift(entry);
  // Keep last 50 entries
  localStorage.setItem("navigation_history", JSON.stringify(history.slice(0, 50)));
};

const getHistory = (): HistoryEntry[] => {
  const stored = localStorage.getItem("navigation_history");
  return stored ? JSON.parse(stored) : [];
};

interface ProfileSectionProps {
  user: User | null;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [history] = useState<HistoryEntry[]>(getHistory());
  const [signLevel, setSignLevel] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState<ProfileData>({
    username: null,
    age: null,
    status: null,
    hearing_status: null,
    profession: null,
    installation_reason: null,
    onboarding_completed: null,
    preferred_age_group: null,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSignLevel();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!error && data) {
      setProfile(data);
      setFormData(data);
    }
    setLoading(false);
  };

  const fetchSignLevel = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_progress")
      .select("level")
      .eq("user_id", user.id)
      .not("level", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      setSignLevel(data[0].level);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        username: formData.username,
        age: formData.age,
        status: formData.status,
        hearing_status: formData.hearing_status,
        profession: formData.profession,
        installation_reason: formData.installation_reason,
        onboarding_completed: true,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Profil mis à jour !");
      setEditing(false);
      fetchProfile();
    }
    setSaving(false);
  };

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-BE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isProfessional = profile?.status === "professionnel" || profile?.profession;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="text-muted-foreground">Chargement du profil...</span>
      </div>
    );
  }

  const hasProfile = profile?.onboarding_completed;

  return (
    <div className="max-w-4xl">
      <Tabs defaultValue="profil">
        <TabsList className="mb-6">
          <TabsTrigger value="profil" className="gap-2">
            <UserIcon className="w-4 h-4" />
            Mon Profil
          </TabsTrigger>
          <TabsTrigger value="historique" className="gap-2">
            <History className="w-4 h-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profil">
          {!hasProfile ? (
            <Card className="p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <UserIcon className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">Créez votre profil</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Complétez vos informations pour personnaliser votre expérience d'apprentissage de la langue des signes.
              </p>
              <Button size="lg" onClick={() => setEditing(true)}>
                Créer mon profil
              </Button>

              {editing && (
                <div className="mt-6 text-left space-y-4 max-w-md mx-auto">
                  <div>
                    <Label>Nom d'utilisateur</Label>
                    <Input
                      value={formData.username || ""}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Votre nom"
                    />
                  </div>
                  <div>
                    <Label>Âge</Label>
                    <Input
                      type="number"
                      value={formData.age || ""}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
                      placeholder="Votre âge"
                    />
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={formData.status || ""} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="etudiant">Étudiant</SelectItem>
                        <SelectItem value="professionnel">Professionnel de santé</SelectItem>
                        <SelectItem value="particulier">Particulier</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Statut auditif</Label>
                    <Select value={formData.hearing_status || ""} onValueChange={(v) => setFormData({ ...formData, hearing_status: v })}>
                      <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="entendant">Entendant</SelectItem>
                        <SelectItem value="malentendant">Malentendant</SelectItem>
                        <SelectItem value="sourd">Sourd</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Profession</Label>
                    <Input
                      value={formData.profession || ""}
                      onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      placeholder="Votre profession"
                    />
                  </div>
                  <div>
                    <Label>Raison d'utilisation</Label>
                    <Input
                      value={formData.installation_reason || ""}
                      onChange={(e) => setFormData({ ...formData, installation_reason: e.target.value })}
                      placeholder="Pourquoi utilisez-vous l'application ?"
                    />
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </div>
              )}
            </Card>
          ) : (
            <div className="space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <UserIcon className="w-10 h-10 text-primary" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-2xl font-bold">{profile?.username || user?.email?.split("@")[0]}</h3>
                      {isProfessional && (
                        <Badge variant="default">Pro de santé</Badge>
                      )}
                      {signLevel && (
                        <Badge variant="secondary">Niveau LSFB : {signLevel}</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground">{user?.email}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setEditing(!editing)}>
                    {editing ? "Annuler" : "Modifier"}
                  </Button>
                </div>
              </Card>

              {editing ? (
                <Card className="p-6 space-y-4">
                  <h4 className="font-semibold text-lg">Modifier mes informations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nom d'utilisateur</Label>
                      <Input
                        value={formData.username || ""}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Âge</Label>
                      <Input
                        type="number"
                        value={formData.age || ""}
                        onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || null })}
                      />
                    </div>
                    <div>
                      <Label>Statut</Label>
                      <Select value={formData.status || ""} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="etudiant">Étudiant</SelectItem>
                          <SelectItem value="professionnel">Professionnel de santé</SelectItem>
                          <SelectItem value="particulier">Particulier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Statut auditif</Label>
                      <Select value={formData.hearing_status || ""} onValueChange={(v) => setFormData({ ...formData, hearing_status: v })}>
                        <SelectTrigger><SelectValue placeholder="Sélectionnez" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entendant">Entendant</SelectItem>
                          <SelectItem value="malentendant">Malentendant</SelectItem>
                          <SelectItem value="sourd">Sourd</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Profession</Label>
                      <Input
                        value={formData.profession || ""}
                        onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Raison d'utilisation</Label>
                      <Input
                        value={formData.installation_reason || ""}
                        onChange={(e) => setFormData({ ...formData, installation_reason: e.target.value })}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSave} disabled={saving} className="gap-2">
                    <Save className="w-4 h-4" />
                    {saving ? "Sauvegarde..." : "Enregistrer les modifications"}
                  </Button>
                </Card>
              ) : (
                <Card className="p-6">
                  <h4 className="font-semibold text-lg mb-4">Mes informations</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Âge</span>
                      <p className="font-medium">{profile?.age || "Non renseigné"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Statut</span>
                      <p className="font-medium">
                        {profile?.status === "professionnel" ? "Professionnel de santé" :
                         profile?.status === "etudiant" ? "Étudiant" :
                         profile?.status === "particulier" ? "Particulier" :
                         profile?.status || "Non renseigné"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Statut auditif</span>
                      <p className="font-medium capitalize">{profile?.hearing_status || "Non renseigné"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Profession</span>
                      <p className="font-medium">{profile?.profession || "Non renseigné"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Niveau LSFB</span>
                      <p className="font-medium">{signLevel || "Non évalué"}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Raison d'utilisation</span>
                      <p className="font-medium">{profile?.installation_reason || "Non renseigné"}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="historique">
          <Card className="p-6">
            <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique de navigation
            </h4>
            {history.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Aucun historique de navigation pour le moment.
              </p>
            ) : (
              <div className="space-y-2">
                {history.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <span className="font-medium">{entry.label}</span>
                    <span className="text-sm text-muted-foreground">
                      {formatDateTime(entry.timestamp)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
