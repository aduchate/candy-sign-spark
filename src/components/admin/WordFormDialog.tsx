import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
}

interface WordSign {
  id: string;
  word: string;
  video_url: string;
  description: string | null;
  source_url: string | null;
  category: string;
}

interface WordFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  word?: WordSign | null;
  onSave: () => void;
}

const CECRL_LEVELS = [
  { value: 'A1', label: 'A1 - Débutant' },
  { value: 'A2', label: 'A2 - Élémentaire' },
  { value: 'B1', label: 'B1 - Intermédiaire' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé' },
  { value: 'C1', label: 'C1 - Avancé' },
  { value: 'C2', label: 'C2 - Maîtrise' },
];

export const WordFormDialog = ({ open, onOpenChange, word, onSave }: WordFormDialogProps) => {
  const [formData, setFormData] = useState({
    word: "",
    video_url: "",
    description: "",
    source_url: "",
    category: "A1"
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  useEffect(() => {
    if (open) {
      loadCategories();
      if (word) {
        setFormData({
          word: word.word,
          video_url: word.video_url,
          description: word.description || "",
          source_url: word.source_url || "",
          category: word.category || "A1"
        });
        loadWordCategories(word.id);
      } else {
        setFormData({
          word: "",
          video_url: "",
          description: "",
          source_url: "",
          category: "A1"
        });
        setSelectedCategories(new Set());
      }
    }
  }, [open, word]);

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from("word_categories")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadWordCategories = async (wordId: string) => {
    try {
      const { data, error } = await supabase
        .from("word_sign_categories")
        .select("category_id")
        .eq("word_sign_id", wordId);

      if (error) throw error;
      setSelectedCategories(new Set(data?.map(d => d.category_id) || []));
    } catch (error) {
      console.error("Error loading word categories:", error);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error("Veuillez sélectionner un fichier vidéo");
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast.error("La vidéo ne doit pas dépasser 50 MB");
      return;
    }

    setVideoFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('lsfb-videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('lsfb-videos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, video_url: publicUrl });
      toast.success("Vidéo uploadée avec succès");
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Erreur lors de l'upload de la vidéo");
      setVideoFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.word.trim() || !formData.video_url.trim()) {
      toast.error("Le mot et l'URL de la vidéo sont requis");
      return;
    }

    setLoading(true);
    try {
      if (word) {
        // Update existing word
        const { error } = await supabase
          .from("word_signs")
          .update({
            word: formData.word.trim(),
            video_url: formData.video_url.trim(),
            description: formData.description.trim() || null,
            source_url: formData.source_url.trim() || null,
            category: formData.category
          })
          .eq("id", word.id);

        if (error) throw error;

        // Update categories
        await supabase
          .from("word_sign_categories")
          .delete()
          .eq("word_sign_id", word.id);

        if (selectedCategories.size > 0) {
          const categoryInserts = Array.from(selectedCategories).map(categoryId => ({
            word_sign_id: word.id,
            category_id: categoryId
          }));

          await supabase
            .from("word_sign_categories")
            .insert(categoryInserts);
        }

        toast.success("Mot modifié avec succès");
      } else {
        // Create new word
        const { data: newWordData, error } = await supabase
          .from("word_signs")
          .insert([{
            word: formData.word.trim(),
            video_url: formData.video_url.trim(),
            description: formData.description.trim() || null,
            source_url: formData.source_url.trim() || null,
            category: formData.category
          }])
          .select()
          .single();

        if (error) throw error;

        // Insert categories
        if (selectedCategories.size > 0 && newWordData) {
          const categoryInserts = Array.from(selectedCategories).map(categoryId => ({
            word_sign_id: newWordData.id,
            category_id: categoryId
          }));

          await supabase
            .from("word_sign_categories")
            .insert(categoryInserts);
        }

        toast.success("Mot ajouté avec succès");
      }

      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving word:", error);
      toast.error("Erreur lors de la sauvegarde du mot");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    const newSet = new Set(selectedCategories);
    if (newSet.has(categoryId)) {
      newSet.delete(categoryId);
    } else {
      newSet.add(categoryId);
    }
    setSelectedCategories(newSet);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {word ? "Modifier le mot" : "Ajouter un nouveau mot"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="word">Mot *</Label>
              <Input
                id="word"
                value={formData.word}
                onChange={(e) => setFormData({ ...formData, word: e.target.value })}
                placeholder="Ex: Bonjour"
              />
            </div>

            <div>
              <Label htmlFor="level">Niveau CECRL *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CECRL_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="video_url">URL de la vidéo *</Label>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    id="video_url"
                    value={formData.video_url}
                    onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                    placeholder="https://..."
                    className="flex-1"
                  />
                  <Label htmlFor="video-upload" className="cursor-pointer">
                    <Button type="button" variant="outline" disabled={uploading} asChild>
                      <span>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                      </span>
                    </Button>
                  </Label>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                </div>
                {videoFile && (
                  <p className="text-xs text-muted-foreground">
                    Fichier sélectionné: {videoFile.name}
                  </p>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="source_url">URL source (optionnel)</Label>
              <Input
                id="source_url"
                value={formData.source_url}
                onChange={(e) => setFormData({ ...formData, source_url: e.target.value })}
                placeholder="https://dico.lsfb.be/..."
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="description">Description (optionnel)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du signe"
                rows={3}
              />
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Catégories thématiques</Label>
            {loadingCategories ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-6 h-6 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-lg max-h-48 overflow-y-auto">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`cat-${category.id}`}
                      checked={selectedCategories.has(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <Label htmlFor={`cat-${category.id}`} className="cursor-pointer text-sm">
                      {category.name}
                    </Label>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className="text-sm text-muted-foreground col-span-full text-center py-2">
                    Aucune catégorie disponible
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {word ? "Enregistrer" : "Ajouter"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
