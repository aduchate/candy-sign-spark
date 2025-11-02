import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Tag } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface Category {
  id: string;
  name: string;
}

interface WordCategoryEditorProps {
  wordId: string;
  wordText: string;
}

export const WordCategoryEditor = ({ wordId, wordText }: WordCategoryEditorProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
      loadWordCategories();
    }
  }, [open, wordId]);

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('word_categories')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error("Erreur lors du chargement des catégories");
    } finally {
      setIsLoading(false);
    }
  };

  const loadWordCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('word_sign_categories')
        .select('category_id')
        .eq('word_sign_id', wordId);

      if (error) throw error;
      
      const categoryIds = new Set(data?.map(item => item.category_id) || []);
      setSelectedCategories(categoryIds);
    } catch (error) {
      console.error('Error loading word categories:', error);
    }
  };

  const handleToggleCategory = (categoryId: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Delete all existing categories for this word
      const { error: deleteError } = await supabase
        .from('word_sign_categories')
        .delete()
        .eq('word_sign_id', wordId);

      if (deleteError) throw deleteError;

      // Insert new categories
      if (selectedCategories.size > 0) {
        const inserts = Array.from(selectedCategories).map(categoryId => ({
          word_sign_id: wordId,
          category_id: categoryId
        }));

        const { error: insertError } = await supabase
          .from('word_sign_categories')
          .insert(inserts);

        if (insertError) throw insertError;
      }

      toast.success("Catégories mises à jour avec succès");
      setOpen(false);
    } catch (error) {
      console.error('Error saving categories:', error);
      toast.error("Erreur lors de la sauvegarde des catégories");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Tag className="w-4 h-4" />
          Éditer les catégories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Catégories pour "{wordText}"</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : (
          <div className="space-y-4">
            <Card className="p-4 max-h-[400px] overflow-y-auto">
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={category.id}
                      checked={selectedCategories.has(category.id)}
                      onCheckedChange={() => handleToggleCategory(category.id)}
                    />
                    <Label
                      htmlFor={category.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  "Sauvegarder"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
