import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Phone, Users, Plus } from "lucide-react";

interface InterpreterService {
  name: string;
  description: string;
  url: string;
  logo?: string;
}

const interpreterServices: InterpreterService[] = [
  {
    name: "Relais-Sign",
    description: "Service de relais en langue des signes pour faciliter vos communications téléphoniques et vos rendez-vous avec les professionnels de santé, administrations et autres services.",
    url: "https://www.relais-sign.be/",
  },
  {
    name: "SISW (Service d'Interprétation en langue des Signes de Wallonie)",
    description: "Service d'interprétation professionnelle en langue des signes pour accompagner les personnes sourdes dans leurs démarches médicales, administratives et professionnelles en Wallonie.",
    url: "https://www.sisw.be/",
  },
  {
    name: "SISB (Service d'Interprétation des Sourds de Bruxelles)",
    description: "Service d'interprétation en langue des signes à Bruxelles, accompagnant les personnes sourdes dans leurs démarches médicales, administratives, professionnelles et de la vie quotidienne.",
    url: "https://www.infosourds.be/service-d-interpretation-des-sourds-de-bruxelles",
  },
];

export const AppointmentBookingSection = () => {
  return (
    <div className="max-w-4xl space-y-8">
      <Card className="p-8 bg-card/40 backdrop-blur-md border-2 shadow-glow">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-3xl gradient-text">Prise de rendez-vous avec interprète</CardTitle>
          <CardDescription className="text-lg">
            Facilitez vos rendez-vous médicaux et administratifs grâce à nos partenaires interprètes en langue des signes.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-lg mb-6">
            <Users className="w-6 h-6 text-primary" />
            <p className="text-sm">
              Ces services vous permettent de communiquer avec des praticiens grâce à l&apos;assistance d&apos;interprètes professionnels en langue des signes.
            </p>
          </div>

          <div className="grid gap-6">
            {interpreterServices.map((service) => (
              <Card key={service.name} className="overflow-hidden hover:shadow-candy transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{service.name}</h3>
                      <p className="text-muted-foreground mb-4">{service.description}</p>
                      <Button
                        onClick={() => window.open(service.url, "_blank")}
                        className="gap-2"
                      >
                        <Phone className="w-4 h-4" />
                        Accéder au service
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Section pour les futures collaborations */}
      <Card className="p-8 border-2 border-dashed border-muted-foreground/30 bg-muted/20">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-muted-foreground">Autres collaborations à venir</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Nous travaillons à étendre notre réseau de partenaires pour vous offrir plus de services d&apos;interprétation et de relais.
          </p>
        </div>
      </Card>

      {/* Conseils */}
      <Card className="p-6 bg-accent/10 border-accent/30">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          💡 Conseils pour votre rendez-vous
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• Réservez votre interprète au moins 48h à l&apos;avance si possible</li>
          <li>• Précisez le type de rendez-vous (médical, administratif, etc.) lors de la demande</li>
          <li>• Indiquez la durée estimée du rendez-vous</li>
          <li>• Communiquez l&apos;adresse exacte et les informations d&apos;accès</li>
        </ul>
      </Card>
    </div>
  );
};
