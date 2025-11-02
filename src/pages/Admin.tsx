import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, UserCog, BookOpen, ClipboardList, Languages, ArrowLeft, Trash2, Edit, Plus, Save, X } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { ExerciseFormDialog } from "@/components/admin/ExerciseFormDialog";
import { WordFormDialog } from "@/components/admin/WordFormDialog";
import { Switch } from "@/components/ui/switch";

interface UserProfile {
  id: string;
  username: string | null;
  email: string;
  age: number | null;
  status: string | null;
  hearing_status: string | null;
  profession: string | null;
  installation_reason: string | null;
  preferred_age_group: string | null;
  roles: string[];
}

interface Lesson {
  id: string;
  title: string;
  description?: string;
  category: string;
  level: string;
  age_group: string;
  order_index: number;
  is_quiz: boolean;
}

interface Exercise {
  id: string;
  lesson_id: string;
  type: string;
  order_index: number;
  content: any;
}

interface WordSign {
  id: string;
  word: string;
  video_url: string;
  description: string | null;
  source_url: string | null;
  category: string;
  categories?: { id: string; name: string }[];
}

interface Category {
  id: string;
  name: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState("users");

  // Users state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Lessons state
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({});

  // Exercises state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string>("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [showExerciseDialog, setShowExerciseDialog] = useState(false);

  // Dictionary state
  const [wordSigns, setWordSigns] = useState<WordSign[]>([]);
  const [loadingWordSigns, setLoadingWordSigns] = useState(false);
  const [editingWord, setEditingWord] = useState<WordSign | null>(null);
  const [showWordDialog, setShowWordDialog] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      setUser(session.user);

      // Check if user is admin
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const hasAdminRole = roles?.some(r => r.role === "admin");
      
      if (!hasAdminRole) {
        toast.error("Accès refusé : vous devez être administrateur");
        navigate("/dashboard");
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error("Auth check error:", error);
      navigate("/auth");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === "users") fetchUsers();
      if (activeTab === "lessons") fetchLessons();
      if (activeTab === "exercises") fetchLessons(); // Need lessons for dropdown
      if (activeTab === "dictionary") fetchWordSigns();
    }
  }, [activeTab, isAdmin]);

  // Fetch Users
  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-users-with-emails');

      if (error) throw error;

      if (data?.users) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoadingUsers(false);
    }
  };

  // Fetch Lessons
  const fetchLessons = async () => {
    setLoadingLessons(true);
    try {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error("Error fetching lessons:", error);
      toast.error("Erreur lors du chargement des leçons");
    } finally {
      setLoadingLessons(false);
    }
  };

  // Fetch Exercises
  const fetchExercises = async (lessonId: string) => {
    setLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from("exercises")
        .select("*")
        .eq("lesson_id", lessonId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error("Error fetching exercises:", error);
      toast.error("Erreur lors du chargement des exercices");
    } finally {
      setLoadingExercises(false);
    }
  };

  // Fetch Word Signs
  const fetchWordSigns = async () => {
    setLoadingWordSigns(true);
    try {
      const { data, error } = await supabase
        .from("word_signs")
        .select(`
          *,
          word_sign_categories (
            category_id,
            word_categories (
              id,
              name
            )
          )
        `)
        .order("word", { ascending: true });

      if (error) throw error;
      
      // Transform data to flatten categories
      const wordsWithCategories = data?.map(word => ({
        ...word,
        categories: word.word_sign_categories?.map((wsc: any) => ({
          id: wsc.word_categories.id,
          name: wsc.word_categories.name
        })) || []
      })) || [];
      
      setWordSigns(wordsWithCategories);
    } catch (error) {
      console.error("Error fetching word signs:", error);
      toast.error("Erreur lors du chargement du dictionnaire");
    } finally {
      setLoadingWordSigns(false);
    }
  };

  const toggleUserRole = async (userId: string, role: "admin" | "user") => {
    try {
      // Check current roles from UI state
      const currentUser = users.find(u => u.id === userId);
      const hasRole = currentUser?.roles?.includes(role);

      const { data, error } = await supabase.functions.invoke('manage-user-role', {
        body: {
          targetUserId: userId,
          role,
          action: hasRole ? 'remove' : 'add'
        }
      });

      if (error) throw error;

      toast.success(hasRole ? `Rôle ${role} retiré avec succès` : `Rôle ${role} ajouté avec succès`);
      await fetchUsers();
    } catch (error) {
      console.error("Error toggling user role:", error);
      toast.error("Erreur lors de la modification du rôle");
    }
  };

  const saveLesson = async (lesson: Partial<Lesson>) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-lesson', {
        body: {
          action: editingLesson ? 'update' : 'create',
          lessonId: editingLesson?.id,
          lessonData: lesson
        }
      });

      if (error) throw error;

      toast.success(editingLesson ? "Leçon modifiée avec succès" : "Leçon créée avec succès");
      setEditingLesson(null);
      setNewLesson({});
      await fetchLessons();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Erreur lors de la sauvegarde de la leçon");
    }
  };

  const deleteLesson = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette leçon ? Tous les exercices associés seront également supprimés.")) return;

    try {
      const { error } = await supabase.functions.invoke('manage-lesson', {
        body: {
          action: 'delete',
          lessonId: id
        }
      });

      if (error) throw error;

      toast.success("Leçon supprimée avec succès");
      await fetchLessons();
    } catch (error) {
      console.error("Error deleting lesson:", error);
      toast.error("Erreur lors de la suppression de la leçon");
    }
  };

  const saveExercise = async (exercise: Partial<Exercise>) => {
    try {
      const { data, error } = await supabase.functions.invoke('manage-exercise', {
        body: {
          action: editingExercise ? 'update' : 'create',
          exerciseId: editingExercise?.id,
          exerciseData: exercise
        }
      });

      if (error) throw error;

      toast.success(editingExercise ? "Exercice modifié avec succès" : "Exercice créé avec succès");
      setEditingExercise(null);
      setShowExerciseDialog(false);
      if (selectedLessonId) {
        await fetchExercises(selectedLessonId);
      }
    } catch (error) {
      console.error("Error saving exercise:", error);
      toast.error("Erreur lors de la sauvegarde de l'exercice");
    }
  };

  const deleteExercise = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) return;

    try {
      const { error } = await supabase.functions.invoke('manage-exercise', {
        body: {
          action: 'delete',
          exerciseId: id
        }
      });

      if (error) throw error;

      toast.success("Exercice supprimé avec succès");
      if (selectedLessonId) {
        await fetchExercises(selectedLessonId);
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      toast.error("Erreur lors de la suppression de l'exercice");
    }
  };


  const deleteWordSign = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce mot ?")) return;

    try {
      const { error } = await supabase
        .from("word_signs")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Mot supprimé avec succès");
      fetchWordSigns();
    } catch (error) {
      console.error("Error deleting word sign:", error);
      toast.error("Erreur lors de la suppression du mot");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5 mr-2" />
              Retour
            </Button>
            <h1 className="text-2xl font-bold">Administration</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Connecté en tant que {user?.email}
          </p>
        </div>
      </header>

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="users" className="gap-2">
              <UserCog className="w-4 h-4" />
              Utilisateurs
            </TabsTrigger>
            <TabsTrigger value="lessons" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Leçons
            </TabsTrigger>
            <TabsTrigger value="exercises" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              Exercices
            </TabsTrigger>
            <TabsTrigger value="dictionary" className="gap-2">
              <Languages className="w-4 h-4" />
              Dictionnaire
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion des Utilisateurs</h2>
                <Button onClick={fetchUsers} disabled={loadingUsers}>
                  {loadingUsers ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualiser"}
                </Button>
              </div>

              {loadingUsers ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Âge</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead>Audition</TableHead>
                        <TableHead>Rôles</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.username || "-"}</TableCell>
                          <TableCell>{user.age || "-"}</TableCell>
                          <TableCell>{user.status || "-"}</TableCell>
                          <TableCell>{user.hearing_status || "-"}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.roles.map(role => (
                                <span key={role} className="px-2 py-1 bg-primary/20 rounded text-xs">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={user.roles.includes("admin") ? "default" : "outline"}
                                onClick={() => toggleUserRole(user.id, "admin")}
                              >
                                {user.roles.includes("admin") ? "Retirer admin" : "Promouvoir admin"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Lessons Tab */}
          <TabsContent value="lessons">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion des Leçons</h2>
                <div className="flex gap-2">
                  <Button onClick={fetchLessons} disabled={loadingLessons} variant="outline">
                    {loadingLessons ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualiser"}
                  </Button>
                  <Button onClick={() => setNewLesson({ order_index: lessons.length })}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvelle leçon
                  </Button>
                </div>
              </div>

              {/* New Lesson Form */}
              {Object.keys(newLesson).length > 0 && (
                <Card className="p-4 mb-6 bg-muted">
                  <h3 className="text-lg font-semibold mb-4">Nouvelle leçon</h3>
                  <div className="mb-4 flex items-center gap-2">
                    <Switch
                      id="new-is-quiz"
                      checked={newLesson.is_quiz || false}
                      onCheckedChange={(checked) => setNewLesson({ ...newLesson, is_quiz: checked })}
                    />
                    <Label htmlFor="new-is-quiz" className="font-semibold">C'est un quiz</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={newLesson.title || ""}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        placeholder="Ex: L'alphabet LSFB"
                      />
                    </div>
                    <div>
                      <Label>Ordre</Label>
                      <Input
                        type="number"
                        value={newLesson.order_index || 0}
                        onChange={(e) => setNewLesson({ ...newLesson, order_index: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={newLesson.description || ""}
                        onChange={(e) => setNewLesson({ ...newLesson, description: e.target.value })}
                        placeholder="Description de la leçon"
                        rows={3}
                      />
                    </div>
                    {!newLesson.is_quiz && (
                      <>
                        <div>
                          <Label>Catégorie</Label>
                          <Select
                            value={newLesson.category || ""}
                            onValueChange={(value) => setNewLesson({ ...newLesson, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une catégorie" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alphabet">Alphabet</SelectItem>
                              <SelectItem value="numbers">Nombres</SelectItem>
                              <SelectItem value="greetings">Salutations</SelectItem>
                              <SelectItem value="family">Famille</SelectItem>
                              <SelectItem value="colors">Couleurs</SelectItem>
                              <SelectItem value="animals">Animaux</SelectItem>
                              <SelectItem value="food">Nourriture</SelectItem>
                              <SelectItem value="emotions">Émotions</SelectItem>
                              <SelectItem value="dates">Dates</SelectItem>
                              <SelectItem value="work">Travail</SelectItem>
                              <SelectItem value="toys">Jouets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Niveau</Label>
                          <Select
                            value={newLesson.level || ""}
                            onValueChange={(value) => setNewLesson({ ...newLesson, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un niveau" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debutant">Débutant</SelectItem>
                              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                              <SelectItem value="avance">Avancé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Groupe d'âge</Label>
                          <Select
                            value={newLesson.age_group || ""}
                            onValueChange={(value) => setNewLesson({ ...newLesson, age_group: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un âge" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enfant">Enfant (3-12 ans)</SelectItem>
                              <SelectItem value="adolescent">Adolescent (13-17 ans)</SelectItem>
                              <SelectItem value="adulte">Adulte (18+ ans)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => saveLesson(newLesson)}>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setNewLesson({})}>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </Card>
              )}

              {/* Edit Lesson Form */}
              {editingLesson && (
                <Card className="p-4 mb-6 bg-muted">
                  <h3 className="text-lg font-semibold mb-4">Modifier la leçon</h3>
                  <div className="mb-4 flex items-center gap-2">
                    <Switch
                      id="edit-is-quiz"
                      checked={editingLesson.is_quiz || false}
                      onCheckedChange={(checked) => setEditingLesson({ ...editingLesson, is_quiz: checked })}
                    />
                    <Label htmlFor="edit-is-quiz" className="font-semibold">C'est un quiz</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Titre</Label>
                      <Input
                        value={editingLesson.title}
                        onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Ordre</Label>
                      <Input
                        type="number"
                        value={editingLesson.order_index}
                        onChange={(e) => setEditingLesson({ ...editingLesson, order_index: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="col-span-2">
                      <Label>Description</Label>
                      <Textarea
                        value={editingLesson.description || ""}
                        onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                        placeholder="Description de la leçon"
                        rows={3}
                      />
                    </div>
                    {!editingLesson.is_quiz && (
                      <>
                        <div>
                          <Label>Catégorie</Label>
                          <Select
                            value={editingLesson.category}
                            onValueChange={(value) => setEditingLesson({ ...editingLesson, category: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="alphabet">Alphabet</SelectItem>
                              <SelectItem value="numbers">Nombres</SelectItem>
                              <SelectItem value="greetings">Salutations</SelectItem>
                              <SelectItem value="family">Famille</SelectItem>
                              <SelectItem value="colors">Couleurs</SelectItem>
                              <SelectItem value="animals">Animaux</SelectItem>
                              <SelectItem value="food">Nourriture</SelectItem>
                              <SelectItem value="emotions">Émotions</SelectItem>
                              <SelectItem value="dates">Dates</SelectItem>
                              <SelectItem value="work">Travail</SelectItem>
                              <SelectItem value="toys">Jouets</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Niveau</Label>
                          <Select
                            value={editingLesson.level}
                            onValueChange={(value) => setEditingLesson({ ...editingLesson, level: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="debutant">Débutant</SelectItem>
                              <SelectItem value="intermediaire">Intermédiaire</SelectItem>
                              <SelectItem value="avance">Avancé</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Groupe d'âge</Label>
                          <Select
                            value={editingLesson.age_group}
                            onValueChange={(value) => setEditingLesson({ ...editingLesson, age_group: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enfant">Enfant (3-12 ans)</SelectItem>
                              <SelectItem value="adolescent">Adolescent (13-17 ans)</SelectItem>
                              <SelectItem value="adulte">Adulte (18+ ans)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => saveLesson(editingLesson)}>
                      <Save className="w-4 h-4 mr-2" />
                      Enregistrer
                    </Button>
                    <Button variant="outline" onClick={() => setEditingLesson(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Annuler
                    </Button>
                  </div>
                </Card>
              )}

              {loadingLessons ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Catégorie</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Âge</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {lesson.is_quiz ? (
                                <ClipboardList className="w-4 h-4 text-primary" />
                              ) : (
                                <BookOpen className="w-4 h-4 text-muted-foreground" />
                              )}
                              {lesson.title}
                            </div>
                          </TableCell>
                          <TableCell>{lesson.category}</TableCell>
                          <TableCell>{lesson.level}</TableCell>
                          <TableCell>{lesson.age_group}</TableCell>
                          <TableCell>{lesson.order_index}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingLesson(lesson)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteLesson(lesson.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Exercises Tab */}
          <TabsContent value="exercises">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion des Exercices</h2>
                {selectedLessonId && (
                  <Button onClick={() => {
                    setEditingExercise(null);
                    setShowExerciseDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouvel exercice
                  </Button>
                )}
              </div>

              <div className="mb-6">
                <Label>Sélectionner une leçon</Label>
                <Select value={selectedLessonId} onValueChange={(value) => {
                  setSelectedLessonId(value);
                  fetchExercises(value);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une leçon..." />
                  </SelectTrigger>
                  <SelectContent>
                    {lessons.map((lesson) => (
                      <SelectItem key={lesson.id} value={lesson.id}>
                        {lesson.title} ({lesson.level} - {lesson.age_group})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {loadingExercises ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : selectedLessonId ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Ordre</TableHead>
                        <TableHead>Contenu</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center text-muted-foreground">
                            Aucun exercice pour cette leçon
                          </TableCell>
                        </TableRow>
                      ) : (
                        exercises.map((exercise) => (
                          <TableRow key={exercise.id}>
                            <TableCell className="font-medium">{exercise.type}</TableCell>
                            <TableCell>{exercise.order_index}</TableCell>
                            <TableCell>
                              <pre className="text-xs max-w-md overflow-auto">
                                {JSON.stringify(exercise.content, null, 2).substring(0, 100)}...
                              </pre>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingExercise(exercise);
                                    setShowExerciseDialog(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => deleteExercise(exercise.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Veuillez sélectionner une leçon
                </p>
              )}
            </Card>

            <ExerciseFormDialog
              open={showExerciseDialog}
              onOpenChange={setShowExerciseDialog}
              exercise={editingExercise}
              lessonId={selectedLessonId}
              onSave={saveExercise}
            />
          </TabsContent>

          <WordFormDialog
            open={showWordDialog}
            onOpenChange={setShowWordDialog}
            word={editingWord}
            onSave={fetchWordSigns}
          />

          {/* Dictionary Tab */}
          <TabsContent value="dictionary">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion du Dictionnaire</h2>
                <div className="flex gap-2">
                  <Button onClick={() => {
                    setEditingWord(null);
                    setShowWordDialog(true);
                  }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nouveau mot
                  </Button>
                  <Button variant="outline" onClick={fetchWordSigns} disabled={loadingWordSigns}>
                    {loadingWordSigns ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualiser"}
                  </Button>
                </div>
              </div>

              {loadingWordSigns ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Mot</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Catégories</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wordSigns.map((word) => (
                        <TableRow key={word.id}>
                          <TableCell className="font-medium">{word.word}</TableCell>
                          <TableCell>{word.category || 'A1'}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {word.categories && word.categories.length > 0 ? (
                                word.categories.map((cat) => (
                                  <span 
                                    key={cat.id} 
                                    className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs"
                                  >
                                    {cat.name}
                                  </span>
                                ))
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {word.description || "-"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingWord(word);
                                  setShowWordDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteWordSign(word.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
