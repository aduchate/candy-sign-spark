import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, Building2 } from "lucide-react";

interface Hospital {
  name: string;
  city: string;
  planUrl: string;
  description?: string;
}

const hospitals: Hospital[] = [
  {
    name: "CHC MontLégia",
    city: "Liège",
    planUrl: "https://www.chc.be/hopitaux/chc-montlegia",
    description: "Plan interactif disponible sur le site officiel"
  },
  {
    name: "CHR de la Citadelle",
    city: "Liège",
    planUrl: "https://www.chrcitadelle.be/",
    description: "Plans des différents bâtiments disponibles"
  },
  {
    name: "CHU de Liège",
    city: "Liège",
    planUrl: "https://www.chuliege.be/",
    description: "Plans du Sart Tilman et Notre-Dame des Bruyères"
  },
  {
    name: "Cliniques universitaires Saint-Luc",
    city: "Bruxelles",
    planUrl: "https://www.saintluc.be/",
    description: "Plan interactif du site hospitalier"
  },
  {
    name: "Erasme",
    city: "Bruxelles",
    planUrl: "https://www.erasme.ulb.ac.be/",
    description: "Plan du campus hospitalier"
  },
  {
    name: "Grand Hôpital de Charleroi",
    city: "Charleroi",
    planUrl: "https://www.ghdc.be/",
    description: "Plans des différents sites disponibles"
  },
  {
    name: "Hôpital Universitaire de Bruxelles (HUB)",
    city: "Bruxelles",
    planUrl: "https://www.hub.brussels/",
    description: "Plans des sites Bordet et Brugmann"
  }
].sort((a, b) => a.name.localeCompare(b.name));

export const HospitalPlansSection = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Plans des Hôpitaux</CardTitle>
          <CardDescription className="text-base">
            Retrouvez les plans des principaux hôpitaux pour vous déplacer facilement dans les infrastructures hospitalières
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {hospitals.map((hospital, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-1">{hospital.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <MapPin className="w-4 h-4" />
                    <span>{hospital.city}</span>
                  </div>
                  {hospital.description && (
                    <p className="text-sm text-muted-foreground">{hospital.description}</p>
                  )}
                </div>
                <Button asChild variant="outline" size="sm">
                  <a href={hospital.planUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
                    Voir le plan
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-muted/50 border-dashed">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground mb-2">
            D'autres hôpitaux seront ajoutés prochainement
          </p>
          <p className="text-sm text-muted-foreground">
            Si vous souhaitez suggérer un hôpital, n'hésitez pas à nous contacter
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
