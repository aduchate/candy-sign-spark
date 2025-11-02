import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, RefreshCw, Search, Calendar, Newspaper } from "lucide-react";

interface NewsArticle {
  id: string;
  title: string;
  excerpt: string | null;
  image_url: string | null;
  source_url: string | null;
  category: string | null;
  published_at: string | null;
  scraped_at: string;
}

export const NewsSection = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchArticles = async () => {
    setLoading(true);
    let query = supabase
      .from("news_articles")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,excerpt.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching articles:", error);
      toast.error("Erreur lors du chargement des actualités");
    } else {
      setArticles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchArticles();
  }, [searchTerm]);

  const handleScrape = async () => {
    setScraping(true);
    toast.info("Importation des actualités en cours...");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-sarew-news");

      if (error) throw error;

      const inserted = data?.inserted || 0;
      const updated = data?.updated || 0;
      if (inserted > 0 || updated > 0) {
        toast.success(`${inserted} nouvelle(s) actualité(s) ajoutée(s), ${updated} mise(s) à jour`);
      } else {
        toast.info('Aucune nouvelle actualité trouvée');
      }
      fetchArticles();
    } catch (error) {
      console.error("Error scraping news:", error);
      toast.error("Erreur lors de l'importation des actualités");
    } finally {
      setScraping(false);
    }
  };

  const categories = [...new Set(articles.map(a => a.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">📰 Actualités SAREW</h2>
            <p className="text-muted-foreground">
              Les dernières nouvelles et événements du SAREW
            </p>
          </div>
          <Button
            onClick={handleScrape}
            disabled={scraping}
            className="gap-2"
            variant="outline"
          >
            {scraping ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Actualiser
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Articles</span>
            </div>
            <p className="text-2xl font-bold">{articles.length}</p>
          </Card>
          {categories.slice(0, 3).map((cat) => (
            <Card key={cat} className="p-4 bg-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="w-5 h-5 text-accent" />
                <span className="text-sm text-muted-foreground truncate">{cat}</span>
              </div>
              <p className="text-2xl font-bold">
                {articles.filter(a => a.category === cat).length}
              </p>
            </Card>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un article..."
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
          <p className="text-muted-foreground mb-4">Aucune actualité disponible</p>
          <Button onClick={handleScrape} disabled={scraping}>
            Importer les actualités
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden hover:shadow-candy transition-shadow">
              {article.image_url && (
                <div className="w-full h-48 overflow-hidden">
                  <img 
                    src={article.image_url} 
                    alt={article.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  {article.category && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                      {article.category}
                    </Badge>
                  )}
                  {article.published_at && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(article.published_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  )}
                </div>
                
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                
                {article.excerpt && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                )}
                
                {article.source_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => window.open(article.source_url!, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4" />
                    Lire l&apos;article
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
