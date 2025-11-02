import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  const [activeCategory, setActiveCategory] = useState<string>("all");

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

  const categories = ["Actualités", "Atelier", "Événements", "Formations accessibles", "Projets"];
  
  const filteredArticles = activeCategory === "all" 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">📰 Toutes les données SAREW</h2>
            <p className="text-muted-foreground">
              Actualités, ateliers, événements, formations et projets
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          <Card className="p-3 bg-primary/5 cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => setActiveCategory("all")}>
            <div className="text-xs text-muted-foreground mb-1">Total</div>
            <p className="text-xl font-bold">{articles.length}</p>
          </Card>
          {categories.map((cat) => (
            <Card 
              key={cat} 
              className="p-3 bg-accent/5 cursor-pointer hover:bg-accent/10 transition-colors"
              onClick={() => setActiveCategory(cat)}
            >
              <div className="text-xs text-muted-foreground mb-1 truncate">{cat}</div>
              <p className="text-xl font-bold">
                {articles.filter(a => a.category === cat).length}
              </p>
            </Card>
          ))}
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
          <TabsList className="w-full flex-wrap h-auto">
            <TabsTrigger value="all" className="flex-1 min-w-[100px]">
              Tout
            </TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="flex-1 min-w-[100px]">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="relative mb-6">
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
      ) : activeCategory === "all" ? (
        <div className="space-y-8">
          {["Actualités", ...categories].map((cat) => {
            const categoryArticles = articles.filter(a => a.category === cat)
            if (categoryArticles.length === 0) return null
            
            return (
              <Card key={cat} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">{cat}</h3>
                  <Badge variant="secondary">{categoryArticles.length} articles</Badge>
                </div>
                
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
                      {categoryArticles.map((article) => (
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
                            {article.source_url && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="gap-2"
                                onClick={() => window.open(article.source_url!, "_blank")}
                              >
                                <ExternalLink className="w-4 h-4" />
                                Voir
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">{activeCategory}</h3>
            <Badge variant="secondary">{filteredArticles.length} articles</Badge>
          </div>
          
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
                {filteredArticles.map((article) => (
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
                      {article.source_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => window.open(article.source_url!, "_blank")}
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir
                        </Button>
                      )}
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
