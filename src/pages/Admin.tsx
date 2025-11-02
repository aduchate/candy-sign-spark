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
  category: string;
  level: string;
  age_group: string;
  order_index: number;
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

  // Dictionary state
  const [wordSigns, setWordSigns] = useState<WordSign[]>([]);
  const [loadingWordSigns, setLoadingWordSigns] = useState(false);
  const [editingWord, setEditingWord] = useState<WordSign | null>(null);
  const [newWord, setNewWord] = useState<Partial<WordSign>>({});

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
        .select("*")
        .order("word", { ascending: true });

      if (error) throw error;
      setWordSigns(data || []);
    } catch (error) {
      console.error("Error fetching word signs:", error);
      toast.error("Erreur lors du chargement du dictionnaire");
    } finally {
      setLoadingWordSigns(false);
    }
  };

  const toggleUserRole = async (userId: string, role: "admin" | "user") => {
    try {
      // Check current roles from database
      const { data: currentRoles, error: fetchError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      if (fetchError) throw fetchError;

      const hasRole = currentRoles?.some(r => r.role === role);
      
      if (hasRole) {
        // Remove role
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role);

        if (error) throw error;
        toast.success(`Rôle ${role} retiré`);
      } else {
        // Add role with ON CONFLICT handling
        const { error } = await supabase
          .from("user_roles")
          .insert({ user_id: userId, role })
          .select();

        if (error) {
          // If conflict, it means role already exists - just show success
          if (error.code === '23505') {
            toast.success(`Rôle ${role} déjà présent`);
          } else {
            throw error;
          }
        } else {
          toast.success(`Rôle ${role} ajouté`);
        }
      }

      fetchUsers();
    } catch (error) {
      console.error("Error toggling role:", error);
      toast.error("Erreur lors de la modification du rôle");
    }
  };

  const saveLesson = async (lesson: Partial<Lesson>) => {
    try {
      if (editingLesson) {
        // Update existing lesson (not implemented yet - read-only table)
        toast.info("Modification de leçon non disponible pour le moment");
      } else {
        // Create new lesson (not implemented yet - read-only table)
        toast.info("Création de leçon non disponible pour le moment");
      }
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast.error("Erreur lors de la sauvegarde de la leçon");
    }
  };

  const saveWordSign = async (wordSign: Partial<WordSign>) => {
    try {
      if (editingWord) {
        // Update
        const { error } = await supabase
          .from("word_signs")
          .update({
            word: wordSign.word,
            description: wordSign.description,
            video_url: wordSign.video_url,
            source_url: wordSign.source_url
          })
          .eq("id", editingWord.id);

        if (error) throw error;
        toast.success("Mot modifié avec succès");
        setEditingWord(null);
      } else {
        // Create
        const { error } = await supabase
          .from("word_signs")
          .insert([{
            word: wordSign.word,
            description: wordSign.description,
            video_url: wordSign.video_url,
            source_url: wordSign.source_url
          }]);

        if (error) throw error;
        toast.success("Mot ajouté avec succès");
        setNewWord({});
      }
      fetchWordSigns();
    } catch (error) {
      console.error("Error saving word sign:", error);
      toast.error("Erreur lors de la sauvegarde du mot");
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
                <Button onClick={fetchLessons} disabled={loadingLessons}>
                  {loadingLessons ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualiser"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-4">
                La modification et la création de leçons seront bientôt disponibles.
              </p>

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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lessons.map((lesson) => (
                        <TableRow key={lesson.id}>
                          <TableCell className="font-medium">{lesson.title}</TableCell>
                          <TableCell>{lesson.category}</TableCell>
                          <TableCell>{lesson.level}</TableCell>
                          <TableCell>{lesson.age_group}</TableCell>
                          <TableCell>{lesson.order_index}</TableCell>
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

              <p className="text-sm text-muted-foreground mb-4">
                La modification et la création d'exercices seront bientôt disponibles.
              </p>

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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exercises.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center text-muted-foreground">
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
          </TabsContent>

          {/* Dictionary Tab */}
          <TabsContent value="dictionary">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Gestion du Dictionnaire</h2>
                <Button onClick={fetchWordSigns} disabled={loadingWordSigns}>
                  {loadingWordSigns ? <Loader2 className="w-4 h-4 animate-spin" /> : "Actualiser"}
                </Button>
              </div>

              {/* Add New Word Form */}
              <Card className="p-4 mb-6 bg-accent/5">
                <h3 className="font-bold mb-4">Ajouter un nouveau mot</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>Mot</Label>
                    <Input
                      value={newWord.word || ""}
                      onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                      placeholder="Ex: Bonjour"
                    />
                  </div>
                  <div>
                    <Label>URL de la vidéo</Label>
                    <Input
                      value={newWord.video_url || ""}
                      onChange={(e) => setNewWord({ ...newWord, video_url: e.target.value })}
                      placeholder="URL de la vidéo"
                    />
                  </div>
                  <div>
                    <Label>Description (optionnel)</Label>
                    <Textarea
                      value={newWord.description || ""}
                      onChange={(e) => setNewWord({ ...newWord, description: e.target.value })}
                      placeholder="Description du signe"
                    />
                  </div>
                  <div>
                    <Label>URL source (optionnel)</Label>
                    <Input
                      value={newWord.source_url || ""}
                      onChange={(e) => setNewWord({ ...newWord, source_url: e.target.value })}
                      placeholder="URL de la source"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => saveWordSign(newWord)}
                  disabled={!newWord.word || !newWord.video_url}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </Button>
              </Card>

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
                        <TableHead>Description</TableHead>
                        <TableHead>Vidéo</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wordSigns.map((word) => (
                        <TableRow key={word.id}>
                          <TableCell className="font-medium">
                            {editingWord?.id === word.id ? (
                              <Input
                                value={editingWord.word}
                                onChange={(e) => setEditingWord({ ...editingWord, word: e.target.value })}
                              />
                            ) : (
                              word.word
                            )}
                          </TableCell>
                          <TableCell>
                            {editingWord?.id === word.id ? (
                              <Textarea
                                value={editingWord.description || ""}
                                onChange={(e) => setEditingWord({ ...editingWord, description: e.target.value })}
                              />
                            ) : (
                              word.description || "-"
                            )}
                          </TableCell>
                          <TableCell>
                            {editingWord?.id === word.id ? (
                              <Input
                                value={editingWord.video_url}
                                onChange={(e) => setEditingWord({ ...editingWord, video_url: e.target.value })}
                              />
                            ) : (
                              <a href={word.video_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                Voir vidéo
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {editingWord?.id === word.id ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="default"
                                    onClick={() => saveWordSign(editingWord)}
                                  >
                                    <Save className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingWord(null)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingWord(word)}
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
                                </>
                              )}
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
