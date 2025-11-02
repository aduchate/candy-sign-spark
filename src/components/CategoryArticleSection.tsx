import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Search, Calendar, Newspaper } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  source_url: string | null;
  category: string | null;
  published_at: string | null;
  scraped_at: string;
  content: string | null;
}

interface CategoryArticleSectionProps {
  category: string;
  icon?: string;
  description?: string;
}

export const CategoryArticleSection = ({ 
  category, 
  icon = "📰", 
  description 
}: CategoryArticleSectionProps) => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from("news_articles")
      .select("*")
      .eq("category", category)
      .order("published_at", { ascending: false, nullsFirst: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, [searchTerm, category]);

  if (selectedArticle) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{selectedArticle.title}</h3>
              {selectedArticle.published_at && (
                <p className="text-sm text-muted-foreground mt-1">
                  Publié le {new Date(selectedArticle.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open(selectedArticle.source_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Site SAREW
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedArticle(null)}
              >
                ← Retour
              </Button>
            </div>
          </div>
          {selectedArticle.category && (
            <Badge variant="outline" className="mt-3">
              {selectedArticle.category}
            </Badge>
          )}
        </Card>
        
        <Card className="p-6">
          {selectedArticle.image_url && (
            <img 
              src={selectedArticle.image_url} 
              alt={selectedArticle.title}
              className="w-full max-h-96 object-cover rounded-lg mb-6"
            />
          )}
          
          {selectedArticle.content ? (
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Le contenu complet n'est pas encore disponible
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(selectedArticle.source_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Voir sur le site SAREW
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">{icon} {category}</h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {articles.length} articles
          </Badge>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher dans cette catégorie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : articles.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">Aucun article disponible dans cette catégorie</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Image</th>
                  <th className="text-left p-3 font-semibold">Titre</th>
                  <th className="text-left p-3 font-semibold">Résumé</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      {article.image_url ? (
                        <img 
                          src={article.image_url} 
                          alt={article.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                          <Newspaper className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </td>
                    <td className="p-3 font-medium max-w-xs">
                      {article.title}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground max-w-md">
                      {article.excerpt ? (
                        <span className="line-clamp-2">{article.excerpt}</span>
                      ) : (
                        <span className="italic">Pas de résumé</span>
                      )}
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">
                      {article.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(article.published_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </div>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => setSelectedArticle(article)}
                        >
                          Afficher
                        </Button>
                        {article.source_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(article.source_url!, "_blank")}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};
