import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Video, Stethoscope, Ear, Activity, UserRound } from "lucide-react";

interface GlossaryTerm {
  term: string;
  definition: string;
  videoUrl?: string;
}

interface ProfessionCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  terms: GlossaryTerm[];
}

export const MedicalGlossary = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);

  const professionCategories: ProfessionCategory[] = [
    {
      id: "logopedes",
      name: "Logopèdes",
      icon: <Stethoscope className="w-5 h-5" />,
      description: "Termes techniques utilisés en logopédie pour la rééducation du langage et de la communication",
      terms: [
        { term: "Aphasie", definition: "Trouble du langage résultant d'une lésion cérébrale, affectant l'expression et/ou la compréhension" },
        { term: "Dysarthrie", definition: "Trouble de l'articulation de la parole dû à une atteinte neurologique des muscles" },
        { term: "Dysphagie", definition: "Difficulté à avaler les aliments ou les liquides" },
        { term: "Bégaiement", definition: "Trouble de la fluence de la parole caractérisé par des répétitions ou des blocages" },
        { term: "Dyslexie", definition: "Trouble spécifique de l'apprentissage de la lecture" },
        { term: "Dysorthographie", definition: "Trouble spécifique de l'apprentissage de l'orthographe" },
        { term: "Retard de langage", definition: "Développement du langage plus lent que la normale pour l'âge" },
        { term: "Articulation", definition: "Production des sons de la parole par les organes phonatoires" },
        { term: "Phonologie", definition: "Étude des sons du langage et de leur organisation" },
        { term: "Déglutition", definition: "Action d'avaler, de faire passer les aliments de la bouche vers l'estomac" },
      ]
    },
    {
      id: "audiologues",
      name: "Audiologues",
      icon: <Ear className="w-5 h-5" />,
      description: "Termes techniques liés à l'audition et à la prise en charge des troubles auditifs",
      terms: [
        { term: "Audiogramme", definition: "Graphique représentant les seuils d'audition à différentes fréquences" },
        { term: "Surdité", definition: "Diminution partielle ou totale de la capacité auditive" },
        { term: "Acouphènes", definition: "Perception de sons (bourdonnements, sifflements) sans source externe" },
        { term: "Prothèse auditive", definition: "Appareil électronique amplifiant les sons pour améliorer l'audition" },
        { term: "Implant cochléaire", definition: "Dispositif électronique implanté chirurgicalement pour restaurer l'audition" },
        { term: "Presbyacousie", definition: "Perte auditive liée au vieillissement" },
        { term: "Otoscopie", definition: "Examen visuel du conduit auditif et du tympan" },
        { term: "Tympanométrie", definition: "Test mesurant la mobilité du tympan et la pression dans l'oreille moyenne" },
        { term: "Hypoacousie", definition: "Baisse de l'acuité auditive, surdité partielle" },
        { term: "Labyrinthite", definition: "Inflammation de l'oreille interne pouvant causer vertiges et perte auditive" },
      ]
    },
    {
      id: "kinesitherapeutes",
      name: "Kinésithérapeutes",
      icon: <Activity className="w-5 h-5" />,
      description: "Termes techniques de la kinésithérapie et de la rééducation fonctionnelle",
      terms: [
        { term: "Amplitude articulaire", definition: "Étendue du mouvement possible d'une articulation" },
        { term: "Proprioception", definition: "Perception de la position et des mouvements du corps dans l'espace" },
        { term: "Renforcement musculaire", definition: "Exercices visant à augmenter la force et l'endurance des muscles" },
        { term: "Mobilisation passive", definition: "Mouvement d'une articulation effectué par le thérapeute sans participation active du patient" },
        { term: "Étirement", definition: "Exercice d'allongement des muscles pour améliorer la souplesse" },
        { term: "Rééducation fonctionnelle", definition: "Ensemble de techniques visant à restaurer les capacités motrices" },
        { term: "Contracture", definition: "Contraction musculaire involontaire et prolongée" },
        { term: "Tendinite", definition: "Inflammation d'un tendon, souvent due à une surcharge" },
        { term: "Posture", definition: "Position du corps dans l'espace, alignement corporel" },
        { term: "Drainage lymphatique", definition: "Technique de massage favorisant la circulation de la lymphe" },
      ]
    },
    {
      id: "medecins",
      name: "Médecins traitants",
      icon: <UserRound className="w-5 h-5" />,
      description: "Termes médicaux généraux utilisés lors des consultations avec le médecin traitant",
      terms: [
        { term: "Anamnèse", definition: "Recueil des antécédents médicaux et des symptômes du patient" },
        { term: "Diagnostic", definition: "Identification d'une maladie à partir des symptômes et examens" },
        { term: "Ordonnance", definition: "Document prescrivant les médicaments et traitements" },
        { term: "Posologie", definition: "Indication de la dose et de la fréquence de prise d'un médicament" },
        { term: "Pronostic", definition: "Prévision de l'évolution probable d'une maladie" },
        { term: "Bilan sanguin", definition: "Analyse de sang permettant d'évaluer l'état de santé" },
        { term: "Tension artérielle", definition: "Pression exercée par le sang sur les parois des artères" },
        { term: "Inflammation", definition: "Réaction de défense de l'organisme face à une agression" },
        { term: "Chronicité", definition: "Caractère d'une maladie qui dure longtemps ou revient régulièrement" },
        { term: "Référent", definition: "Médecin coordinateur du parcours de soins du patient" },
      ]
    },
  ];

  const filterTerms = (terms: GlossaryTerm[]) => {
    if (!searchTerm.trim()) return terms;
    return terms.filter(t => 
      t.term.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.definition.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-2">Glossaire Paramédical LSFB</h3>
        <p className="text-muted-foreground mb-6">
          Termes techniques classés par profession. Les vidéos en langue des signes seront ajoutées progressivement.
        </p>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher un terme..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Tabs defaultValue="logopedes" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto gap-2 bg-transparent">
          {professionCategories.map((category) => (
            <TabsTrigger
              key={category.id}
              value={category.id}
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground px-4 py-3"
            >
              {category.icon}
              <span className="hidden sm:inline">{category.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {professionCategories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="mt-6">
            <Card className="p-4 mb-4 bg-muted/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  {category.icon}
                </div>
                <div>
                  <h4 className="font-semibold">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">{category.description}</p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filterTerms(category.terms).map((term, index) => (
                <Card
                  key={index}
                  className={`p-4 cursor-pointer transition-all duration-300 hover:shadow-md ${
                    selectedTerm?.term === term.term ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedTerm(term)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-lg flex items-center gap-2">
                        {term.term}
                        {term.videoUrl ? (
                          <Video className="w-4 h-4 text-green-500" />
                        ) : (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                            Vidéo à venir
                          </span>
                        )}
                      </h5>
                      <p className="text-sm text-muted-foreground mt-1">
                        {term.definition}
                      </p>
                    </div>
                  </div>

                  {term.videoUrl && (
                    <div className="mt-3 aspect-video bg-muted rounded-md overflow-hidden">
                      <video
                        src={term.videoUrl}
                        controls
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </Card>
              ))}
            </div>

            {filterTerms(category.terms).length === 0 && (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">
                  Aucun terme trouvé pour "{searchTerm}"
                </p>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Espace pour futures collaborations */}
      <Card className="p-6 border-dashed border-2">
        <h4 className="font-semibold mb-2 flex items-center gap-2">
          📋 Futures catégories
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          D'autres professions paramédicales seront ajoutées prochainement :
        </p>
        <div className="flex flex-wrap gap-2">
          {["Ergothérapeutes", "Psychomotriciens", "Orthoptistes", "Diététiciens", "Podologues"].map((profession) => (
            <span
              key={profession}
              className="px-3 py-1 bg-muted rounded-full text-sm text-muted-foreground"
            >
              {profession}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
};
