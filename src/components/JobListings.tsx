import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, MapPin, Building2, RefreshCw, Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface JobListing {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  source_url: string | null;
  location: string | null;
  company: string | null;
  requirements: string | null;
  contact_info: string | null;
  published_at: string | null;
  scraped_at: string;
}

export const JobListings = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("job_listings")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (selectedCategory) {
      query = query.eq("category", selectedCategory);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Erreur lors du chargement des offres");
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory, searchTerm]);

  const handleScrape = async () => {
    setScraping(true);
    toast.info("Importation des offres en cours...");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-sarew-jobs");

      if (error) throw error;

      toast.success(`${data?.count || 0} offres importées avec succès`);
      fetchJobs();
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Erreur lors de l'importation des offres");
    } finally {
      setScraping(false);
    }
  };

  const categories = [...new Set(jobs.map(j => j.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">💼 Aide à l&apos;Emploi</h2>
            <p className="text-muted-foreground">
              Offres d&apos;emploi et ressources pour les personnes sourdes et malentendantes
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

        <div className="flex gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher une offre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={selectedCategory || ""}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 rounded-md border bg-background"
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat || ""}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Aucune offre d&apos;emploi disponible</p>
          <Button onClick={handleScrape} disabled={scraping}>
            Importer les offres
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Titre</TableHead>
                <TableHead>Catégorie</TableHead>
                <TableHead>Entreprise</TableHead>
                <TableHead>Lieu</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>
                    {job.category && (
                      <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs">
                        {job.category}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.company && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        {job.company}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        {job.location}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.published_at
                      ? new Date(job.published_at).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell className="text-right">
                    {job.source_url && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(job.source_url!, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
};