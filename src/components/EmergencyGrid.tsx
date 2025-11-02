import { Card } from "@/components/ui/card";

const emergencyVocabulary = [
  {
    word: "Urgence",
    description: "Situation qui nécessite une action immédiate",
    category: "urgence"
  },
  {
    word: "Aide",
    description: "Demander de l'assistance",
    category: "urgence"
  },
  {
    word: "Médecin",
    description: "Professionnel de santé",
    category: "santé"
  },
  {
    word: "Hôpital",
    description: "Établissement de soins",
    category: "santé"
  },
  {
    word: "Ambulance",
    description: "Véhicule d'urgence médicale",
    category: "santé"
  },
  {
    word: "Police",
    description: "Forces de l'ordre",
    category: "sécurité"
  },
  {
    word: "Pompiers",
    description: "Service d'incendie et de secours",
    category: "sécurité"
  },
  {
    word: "Danger",
    description: "Situation risquée",
    category: "sécurité"
  },
  {
    word: "Accident",
    description: "Événement soudain et imprévu",
    category: "urgence"
  },
  {
    word: "Douleur",
    description: "Sensation désagréable",
    category: "santé"
  },
  {
    word: "Mal",
    description: "Se sentir mal",
    category: "santé"
  },
  {
    word: "Téléphone",
    description: "Pour appeler les secours",
    category: "communication"
  },
  {
    word: "112",
    description: "Numéro d'urgence européen",
    category: "urgence"
  },
  {
    word: "Sortie",
    description: "Sortie de secours",
    category: "sécurité"
  },
  {
    word: "Feu",
    description: "Incendie",
    category: "sécurité"
  },
  {
    word: "Eau",
    description: "Besoin vital",
    category: "besoins"
  }
];

export const EmergencyGrid = () => {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-destructive/5 to-orange/5 border-2">
        <h3 className="text-2xl font-bold mb-4 gradient-text">🏥 Situations d&apos;urgence</h3>
        <p className="text-muted-foreground mb-6">
          Vocabulaire essentiel pour les situations d&apos;urgence, la santé et la sécurité. Ces signes peuvent sauver des vies.
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {emergencyVocabulary.map((item) => (
            <Card key={item.word} className="p-4 bg-card hover:shadow-candy transition-all">
              <h4 className="font-bold text-lg mb-1">{item.word}</h4>
              <p className="text-xs text-muted-foreground">{item.description}</p>
              <div className="mt-2 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs inline-block">
                {item.category}
              </div>
            </Card>
          ))}
        </div>
      </Card>

      <Card className="p-6 bg-orange/5 border-2 border-orange/20">
        <h4 className="text-xl font-bold mb-3 flex items-center gap-2">
          ⚠️ Conseils importants
        </h4>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex gap-2">
            <span>•</span>
            <span>En cas d&apos;urgence, restez calme et utilisez les signes pour communiquer clairement</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Le numéro d&apos;urgence européen 112 accepte les appels SMS pour les personnes sourdes</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Montrez votre carte d&apos;identité ou bracelet médical si vous en avez un</span>
          </li>
          <li className="flex gap-2">
            <span>•</span>
            <span>Ayez toujours sur vous les coordonnées d&apos;un contact d&apos;urgence</span>
          </li>
        </ul>
      </Card>
    </div>
  );
};