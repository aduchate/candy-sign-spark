import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Heart, Coins, Users, HandHeart } from "lucide-react";

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
  const donationUrl = "https://www.sarew.be/nous-soutenir";

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 gradient-text">
              {icon} Soutenir {organization}
            </h2>
            {description && (
              <p className="text-muted-foreground">{description}</p>
            )}
            <Badge variant="secondary" className="mt-2">
              {organization}
            </Badge>
          </div>
          <Heart className="w-12 h-12 text-primary" />
        </div>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <Coins className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Don unique</h3>
          <p className="text-muted-foreground mb-4">
            Faites un don ponctuel pour soutenir nos actions
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <Users className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Don mensuel</h3>
          <p className="text-muted-foreground mb-4">
            Soutenez-nous régulièrement avec un don mensuel
          </p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <HandHeart className="w-12 h-12 mx-auto mb-4 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Legs & donations</h3>
          <p className="text-muted-foreground mb-4">
            Inscrivez SAREW dans votre testament
          </p>
        </Card>
      </div>

      <Card className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-4">Pourquoi nous soutenir ?</h3>
            <p className="text-lg text-muted-foreground mb-6">
              SAREW œuvre pour l'inclusion et l'accessibilité des personnes sourdes et malentendantes. 
              Votre générosité nous permet de continuer notre mission et d'accompagner notre communauté.
            </p>
          </div>

          <div className="bg-muted/50 p-6 rounded-lg mb-8">
            <h4 className="text-xl font-semibold mb-4">Attestation fiscale</h4>
            <p className="mb-4">
              Afin d'établir votre attestation fiscale, merci de nous communiquer par mail à l'adresse{" "}
              <a href="mailto:info@sarew.be" className="text-primary hover:underline font-semibold">
                info@sarew.be
              </a>
            </p>
            <p className="font-semibold mb-2">Les informations suivantes :</p>
            <ul className="space-y-2 ml-6">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                <span>Nom, Prénom</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                <span>Numéro de registre national</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2" />
                <span>Votre adresse</span>
              </li>
            </ul>
          </div>
          
          <div className="space-y-4 text-left mb-8">
            <h4 className="text-xl font-semibold">Nos missions</h4>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Service d'Aide à la recherche d'un emploi pour personnes sourdes et malentendantes en Wallonie</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Formation en langue des signes pour les familles et professionnels</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Accompagnement et soutien aux personnes sourdes</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              <p>Organisation d'événements et d'ateliers inclusifs</p>
            </div>
          </div>

          <div className="text-center">
            <Button 
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() => window.open(donationUrl, "_blank")}
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Faire un don maintenant
            </Button>
            
            <p className="text-sm text-muted-foreground mt-4">
              Vous serez redirigé vers le site de SAREW
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Contact pour plus d'informations sur les dons
          </p>
          <p className="font-semibold">info@sarew.be</p>
        </div>
      </Card>
    </div>
  );
};
