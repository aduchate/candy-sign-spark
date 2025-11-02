import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, RefreshCw, Heart } from "lucide-react";
import { toast } from "sonner";

interface DonationPage {
  id: string;
  organization: string;
  title: string;
  content: string | null;
  source_url: string | null;
  image_url: string | null;
  scraped_at: string;
}

interface DonationSectionProps {
  organization: string;
  icon?: string;
  description?: string;
}

export const DonationSection = ({ 
  organization,
  icon = "❤️",
  description 
}: DonationSectionProps) => {
  const [page, setPage] = useState<DonationPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPage = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donation_pages")
      .select("*")
      .eq("organization", organization)
      .single();

    if (error) {
      console.error("Error fetching donation page:", error);
      toast.error("Erreur lors du chargement de la page");
    } else {
      setPage(data);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('scrape-sarew-donation');
      
      if (error) {
        console.error("Error refreshing donation page:", error);
        toast.error("Erreur lors de l'actualisation");
      } else {
        toast.success("Page actualisée avec succès!");
        await fetchPage();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [organization]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <Card className="p-12 text-center">
        <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Aucune page de don disponible</h3>
        <p className="text-muted-foreground mb-6">
          Cliquez sur le bouton ci-dessous pour charger les informations
        </p>
        <Button onClick={handleRefresh} disabled={refreshing}>
          {refreshing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Chargement...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Charger les informations
            </>
          )}
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">
              {icon} {page.title}
            </h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            <Badge variant="secondary" className="mt-2">
              {page.organization}
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
            {page.source_url && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(page.source_url!, "_blank")}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Site SAREW
              </Button>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6">
        {page.image_url && (
          <img 
            src={page.image_url} 
            alt={page.title}
            className="w-full max-h-96 object-cover rounded-lg mb-6"
          />
        )}
        
        {page.content ? (
          <div 
            className="prose prose-slate max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Le contenu n'est pas encore disponible
            </p>
            <Button 
              variant="outline"
              onClick={() => window.open(page.source_url!, "_blank")}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Voir sur le site SAREW
            </Button>
          </div>
        )}
      </Card>

      {page.scraped_at && (
        <p className="text-sm text-muted-foreground text-center">
          Dernière actualisation: {new Date(page.scraped_at).toLocaleString("fr-FR")}
        </p>
      )}
    </div>
  );
};
