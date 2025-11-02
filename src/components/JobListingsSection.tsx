import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, ExternalLink, Search, Calendar, Briefcase, MapPin, RefreshCw, Building2, Mail } from "lucide-react";
import { toast } from "sonner";
import sarewHomepage from "@/assets/sarew-homepage.png";

interface JobListing {
  id: string;
  title: string;
  company: string | null;
  location: string | null;
  description: string | null;
  requirements: string | null;
  contact_info: string | null;
  category: string | null;
  published_at: string | null;
  source_url: string | null;
  scraped_at: string;
}

export const JobListingsSection = () => {
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);

  const fetchJobs = async () => {
    setLoading(true);
    let query = supabase
      .from("job_listings")
      .select("*")
      .order("published_at", { ascending: false, nullsFirst: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,company.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Erreur lors du chargement des offres d'emploi");
    } else {
      setJobs(data || []);
    }
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const { error } = await supabase.functions.invoke('scrape-sarew-jobs');
      
      if (error) {
        console.error("Error refreshing jobs:", error);
        toast.error("Erreur lors de l'actualisation");
      } else {
        toast.success("Offres d'emploi actualisées avec succès!");
        await fetchJobs();
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Erreur lors de l'actualisation");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchTerm]);

  if (selectedJob) {
    return (
      <div className="space-y-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">{selectedJob.title}</h3>
              {selectedJob.company && (
                <p className="text-lg text-muted-foreground mt-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  {selectedJob.company}
                </p>
              )}
              {selectedJob.location && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedJob.location}
                </p>
              )}
              {selectedJob.published_at && (
                <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Publié le {new Date(selectedJob.published_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {selectedJob.source_url && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open(selectedJob.source_url!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Site SAREW
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedJob(null)}
              >
                ← Retour
              </Button>
            </div>
          </div>
          {selectedJob.category && (
            <Badge variant="outline" className="mt-3">
              {selectedJob.category}
            </Badge>
          )}
        </Card>
        
        <Card className="p-6">
          {selectedJob.description && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Description du poste</h4>
              <div className="prose prose-slate max-w-none">
                {selectedJob.description.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {selectedJob.requirements && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold mb-3">Profil recherché</h4>
              <div className="prose prose-slate max-w-none">
                {selectedJob.requirements.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

          {selectedJob.contact_info && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Contact
              </h4>
              <p className="text-muted-foreground">{selectedJob.contact_info}</p>
            </div>
          )}

          {!selectedJob.description && !selectedJob.requirements && !selectedJob.contact_info && (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Le contenu complet n'est pas encore disponible
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open(selectedJob.source_url!, "_blank")}
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
            <h2 className="text-3xl font-bold mb-2 gradient-text">💼 Aide à l'Emploi</h2>
            <p className="text-muted-foreground">
              Service d'Aide à la recherche d'un emploi pour personnes sourdes et malentendantes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {jobs.length} offres
            </Badge>
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
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher une offre d'emploi..."
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
          <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Aucune offre d'emploi disponible</p>
        </Card>
      ) : (
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-semibold">Poste</th>
                  <th className="text-left p-3 font-semibold">Entreprise</th>
                  <th className="text-left p-3 font-semibold">Lieu</th>
                  <th className="text-left p-3 font-semibold">Catégorie</th>
                  <th className="text-left p-3 font-semibold">Date</th>
                  <th className="text-left p-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium max-w-xs">
                      {job.title}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {job.company ? (
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {job.company}
                        </span>
                      ) : (
                        <span className="italic">Non spécifié</span>
                      )}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {job.location ? (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                      ) : (
                        <span className="italic">Non spécifié</span>
                      )}
                    </td>
                    <td className="p-3 text-sm">
                      {job.category && (
                        <Badge variant="outline">{job.category}</Badge>
                      )}
                    </td>
                    <td className="p-3 text-sm whitespace-nowrap">
                      {job.published_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(job.published_at).toLocaleDateString("fr-FR", {
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
                          onClick={() => setSelectedJob(job)}
                        >
                          Afficher
                        </Button>
                        {job.source_url && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(job.source_url!, "_blank")}
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
