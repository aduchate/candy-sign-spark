import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, ExternalLink, MapPin, Building2, RefreshCw, Search, Briefcase, Calendar } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("all");

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("job_listings")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });

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
  }, [searchTerm]);

  const handleScrape = async () => {
    setScraping(true);
    toast.info("Importation des offres en cours...");

    try {
      const { data, error } = await supabase.functions.invoke("scrape-sarew-jobs");

      if (error) throw error;

      const inserted = data?.inserted || 0;
      const updated = data?.updated || 0;
      if (inserted > 0 || updated > 0) {
        toast.success(`${inserted} nouvelle(s) offre(s) ajoutée(s), ${updated} mise(s) à jour`);
      } else {
        toast.info('Aucune nouvelle offre trouvée');
      }
      fetchJobs();
    } catch (error) {
      console.error("Error scraping jobs:", error);
      toast.error("Erreur lors de l'importation des offres");
    } finally {
      setScraping(false);
    }
  };

  const filteredJobs = activeTab === "all" 
    ? jobs 
    : jobs.filter(job => job.category === activeTab);

  const categories = [...new Set(jobs.map(j => j.category).filter(Boolean))];
  const stats = {
    total: jobs.length,
    cdd: jobs.filter(j => j.category === "CDD").length,
    cdr: jobs.filter(j => j.category === "CDR").length,
    cdi: jobs.filter(j => j.category === "CDI").length,
  };

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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-primary/5">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-4 bg-blue-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              <span className="text-sm text-muted-foreground">CDD</span>
            </div>
            <p className="text-2xl font-bold">{stats.cdd}</p>
          </Card>
          <Card className="p-4 bg-green-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <span className="text-sm text-muted-foreground">CDR</span>
            </div>
            <p className="text-2xl font-bold">{stats.cdr}</p>
          </Card>
          <Card className="p-4 bg-purple-500/5">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-sm text-muted-foreground">CDI</span>
            </div>
            <p className="text-2xl font-bold">{stats.cdi}</p>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une offre..."
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
      ) : jobs.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground mb-4">Aucune offre d&apos;emploi disponible</p>
          <Button onClick={handleScrape} disabled={scraping}>
            Importer les offres
          </Button>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 mb-6">
            <TabsTrigger value="all" className="gap-2">
              <Briefcase className="w-4 h-4" />
              Toutes ({stats.total})
            </TabsTrigger>
            <TabsTrigger value="CDD" className="gap-2">
              CDD ({stats.cdd})
            </TabsTrigger>
            <TabsTrigger value="CDR" className="gap-2">
              CDR ({stats.cdr})
            </TabsTrigger>
            <TabsTrigger value="CDI" className="gap-2">
              CDI ({stats.cdi})
            </TabsTrigger>
            <TabsTrigger value="Offre d'emploi" className="gap-2">
              Autres ({stats.total - stats.cdd - stats.cdr - stats.cdi})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            <Card className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Titre du poste</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Aucune offre dans cette catégorie
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold">{job.title}</span>
                            {job.description && (
                              <span className="text-xs text-muted-foreground line-clamp-2">
                                {job.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {job.category && (
                            <Badge 
                              variant="outline" 
                              className={
                                job.category === "CDD" ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                job.category === "CDR" ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                job.category === "CDI" ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                "bg-primary/10 text-primary border-primary/20"
                              }
                            >
                              {job.category}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.company && (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{job.company}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {job.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {job.published_at
                              ? new Date(job.published_at).toLocaleDateString("fr-FR", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric"
                                })
                              : "N/A"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {job.source_url && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => window.open(job.source_url!, "_blank")}
                              className="gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              Voir
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};