import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface Link {
  title: string;
  description: string;
  url: string;
  category: string;
}

const links: Link[] = [
  {
    title: "FFSB - Fédération Francophone des Sourds de Belgique",
    description: "Association représentant la communauté sourde francophone en Belgique",
    url: "https://www.ffsb.be/",
    category: "Associations"
  },
  {
    title: "Dico LSFB",
    description: "Dictionnaire en ligne de la Langue des Signes de Belgique Francophone",
    url: "https://dico.lsfb.be/",
    category: "Dictionnaires"
  },
  {
    title: "Centre de Communication Concrète",
    description: "Centre de formation et de services pour personnes sourdes et malentendantes",
    url: "https://www.cccommunication.be/",
    category: "Formation"
  },
  {
    title: "Surdimobil",
    description: "Service d'interprétation à distance pour personnes sourdes",
    url: "https://www.surdimobil.be/",
    category: "Services"
  },
  {
    title: "APEDAF",
    description: "Association des Parents d'Enfants Déficients Auditifs Francophones",
    url: "https://www.apedaf.be/",
    category: "Associations"
  },
];

const categories = Array.from(new Set(links.map(link => link.category)));

export const UsefulLinks = () => {
  return (
    <div className="max-w-6xl space-y-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">Liens Utiles</h3>
        <p className="text-muted-foreground">
          Découvrez des ressources, associations et services en lien avec la surdité et la langue des signes
        </p>
      </div>

      {categories.map((category) => (
        <div key={category}>
          <h4 className="text-xl font-semibold mb-4 text-primary">{category}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {links
              .filter((link) => link.category === category)
              .map((link) => (
                <Card 
                  key={link.url}
                  className="p-6 hover:shadow-candy transition-all duration-300 hover:scale-[1.02] border-2 cursor-pointer"
                  onClick={() => window.open(link.url, '_blank')}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h5 className="font-bold mb-2 flex items-center gap-2">
                        {link.title}
                        <ExternalLink className="w-4 h-4 text-primary" />
                      </h5>
                      <p className="text-sm text-muted-foreground">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      ))}

      <Card className="p-6 bg-muted/50 border-2">
        <p className="text-sm text-muted-foreground text-center">
          💡 Ces liens s'ouvrent dans un nouvel onglet. N'hésitez pas à explorer ces ressources pour en apprendre davantage sur la communauté sourde et la langue des signes.
        </p>
      </Card>
    </div>
  );
};
