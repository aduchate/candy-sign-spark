import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, Baby, Briefcase, GraduationCap, ChevronLeft, Stethoscope, Brain, Dumbbell, UserCheck, Heart, TestTube2 } from "lucide-react";
import { LevelTabs } from "./LevelTabs";

type Step = "age" | "adult-choice" | "professions" | "leisure-levels" | "child-choice" | "early-childhood" | "childhood";
type AgeGroup = "adulte" | "enfant" | null;
type AdultPath = "professionnel" | "loisir" | null;
type ChildPath = "petite-enfance" | "enfance" | null;

const professions = [
  { id: "logopédie", name: "Logopédie", icon: Heart },
  { id: "audiologie", name: "Audiologie", icon: Stethoscope },
  { id: "psychologie", name: "Psychologie", icon: Brain },
  { id: "médecine", name: "Médecine traitant", icon: TestTube2 },
  { id: "kinésithérapeute", name: "Kinésithérapeute", icon: Dumbbell },
  { id: "éducateur", name: "Éducateur spécialisé", icon: UserCheck },
];

export const LearningDecisionTree = () => {
  const [currentStep, setCurrentStep] = useState<Step>("age");
  const [ageGroup, setAgeGroup] = useState<AgeGroup>(null);
  const [adultPath, setAdultPath] = useState<AdultPath>(null);
  const [childPath, setChildPath] = useState<ChildPath>(null);
  const [selectedLevel, setSelectedLevel] = useState<"A1" | "A2" | "B1" | "B2">("A1");
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);

  const handleAgeSelect = (age: "adulte" | "enfant") => {
    setAgeGroup(age);
    if (age === "adulte") {
      setCurrentStep("adult-choice");
    } else {
      setCurrentStep("child-choice");
    }
  };

  const handleAdultPathSelect = (path: "professionnel" | "loisir") => {
    setAdultPath(path);
    if (path === "professionnel") {
      setCurrentStep("professions");
    } else {
      setCurrentStep("leisure-levels");
    }
  };

  const handleChildPathSelect = (path: "petite-enfance" | "enfance") => {
    setChildPath(path);
    if (path === "petite-enfance") {
      setCurrentStep("early-childhood");
    } else {
      setCurrentStep("childhood");
    }
  };

  const handleBack = () => {
    if (currentStep === "adult-choice" || currentStep === "child-choice") {
      setCurrentStep("age");
      setAgeGroup(null);
      setAdultPath(null);
      setChildPath(null);
    } else if (currentStep === "professions" || currentStep === "leisure-levels") {
      setCurrentStep("adult-choice");
      setAdultPath(null);
      setSelectedProfession(null);
    } else if (currentStep === "early-childhood" || currentStep === "childhood") {
      setCurrentStep("child-choice");
      setChildPath(null);
    }
  };

  const renderBreadcrumb = () => {
    const items = [];
    
    if (ageGroup === "adulte") items.push("Adulte");
    if (ageGroup === "enfant") items.push("Enfant");
    if (adultPath === "professionnel") items.push("Professionnel");
    if (adultPath === "loisir") items.push("Loisir");
    if (childPath === "petite-enfance") items.push("Petite enfance");
    if (childPath === "enfance") items.push("Enfance");
    if (selectedProfession) items.push(professions.find(p => p.id === selectedProfession)?.name || "");

    return items.length > 0 ? (
      <div className="mb-6 text-sm text-muted-foreground flex items-center gap-2">
        <span>Parcours:</span>
        {items.map((item, index) => (
          <span key={index} className="flex items-center gap-2">
            {index > 0 && <span>›</span>}
            <span className="font-medium text-foreground">{item}</span>
          </span>
        ))}
      </div>
    ) : null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {currentStep !== "age" && (
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      )}

      {renderBreadcrumb()}

      {/* Étape 1: Choix de l'âge */}
      {currentStep === "age" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Commençons votre parcours d'apprentissage</h2>
            <p className="text-muted-foreground">Sélectionnez votre profil pour une expérience adaptée</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleAgeSelect("adulte")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-candy flex items-center justify-center mb-4">
                  <Users className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Adulte</h3>
                <p className="text-muted-foreground">Apprentissage professionnel ou par niveaux</p>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleAgeSelect("enfant")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mb-4">
                  <Baby className="w-10 h-10 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Enfant</h3>
                <p className="text-muted-foreground">Apprentissage ludique et adapté</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Étape 2: Choix adulte - Professionnel ou Loisir */}
      {currentStep === "adult-choice" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Quel est votre objectif ?</h2>
            <p className="text-muted-foreground">Choisissez le type d'apprentissage qui vous correspond</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleAdultPathSelect("professionnel")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-candy flex items-center justify-center mb-4">
                  <Briefcase className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Professionnel</h3>
                <p className="text-muted-foreground">Formations adaptées aux métiers de la santé et du social</p>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleAdultPathSelect("loisir")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-accent flex items-center justify-center mb-4">
                  <GraduationCap className="w-10 h-10 text-accent-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Loisir (par niveaux)</h3>
                <p className="text-muted-foreground">Apprentissage progressif du LSFB de A1 à B2</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Étape 3a: Choix de la profession */}
      {currentStep === "professions" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Sélectionnez votre domaine professionnel</h2>
            <p className="text-muted-foreground">Contenu spécialisé pour votre profession</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professions.map((profession) => {
              const Icon = profession.icon;
              return (
                <Card 
                  key={profession.id}
                  className={`p-6 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2 ${
                    selectedProfession === profession.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedProfession(profession.id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full gradient-candy flex items-center justify-center mb-3">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-bold">{profession.name}</h3>
                  </div>
                </Card>
              );
            })}
          </div>

          {selectedProfession && (
            <Card className="p-6 mt-6 bg-muted">
              <p className="text-center text-muted-foreground">
                Contenu professionnel pour {professions.find(p => p.id === selectedProfession)?.name} en cours de développement
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Étape 3b: Choix des niveaux avec test */}
      {currentStep === "leisure-levels" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Choisissez votre niveau</h2>
            <p className="text-muted-foreground">Ou passez notre test pour évaluer votre niveau actuel</p>
          </div>

          <Card className="p-6 mb-6 bg-primary/10 border-primary">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-1">Pas sûr de votre niveau ?</h3>
                <p className="text-muted-foreground">Passez notre test d'évaluation pour découvrir votre niveau</p>
              </div>
              <Button className="gradient-candy">
                <TestTube2 className="w-4 h-4 mr-2" />
                Passer le test
              </Button>
            </div>
          </Card>

          <LevelTabs selected={selectedLevel} onSelect={setSelectedLevel} />

          <Card className="p-6 mt-6">
            <h3 className="text-xl font-bold mb-4">Leçons niveau {selectedLevel}</h3>
            <p className="text-muted-foreground text-center py-8">
              Les leçons pour le niveau {selectedLevel} seront affichées ici
            </p>
          </Card>
        </div>
      )}

      {/* Étape 2b: Choix enfant - Petite enfance ou Enfance */}
      {currentStep === "child-choice" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Quelle tranche d'âge ?</h2>
            <p className="text-muted-foreground">Sélectionnez la catégorie adaptée</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleChildPathSelect("petite-enfance")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-candy flex items-center justify-center mb-4">
                  <Baby className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Petite enfance</h3>
                <p className="text-muted-foreground">Jeux et activités pour les tout-petits</p>
              </div>
            </Card>

            <Card 
              className="p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 border-2"
              onClick={() => handleChildPathSelect("enfance")}
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full gradient-success flex items-center justify-center mb-4">
                  <GraduationCap className="w-10 h-10 text-success-foreground" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Enfance</h3>
                <p className="text-muted-foreground">Apprentissage ludique et interactif</p>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Étape 3c: Petite enfance - Jeu désignation buzzer */}
      {currentStep === "early-childhood" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Jeu désignation buzzer</h2>
            <p className="text-muted-foreground">Jeux interactifs pour la petite enfance</p>
          </div>

          <Card className="p-12 text-center bg-muted">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
                <Baby className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-4">À venir très prochainement !</h3>
              <p className="text-muted-foreground">
                Des jeux amusants et éducatifs spécialement conçus pour les tout-petits seront bientôt disponibles.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Étape 3d: Enfance - Interface attractive */}
      {currentStep === "childhood" && (
        <div className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Apprends en t'amusant ! 🎨
            </h2>
            <p className="text-muted-foreground">Des exercices ludiques pour progresser</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 hover:shadow-candy transition-all cursor-pointer border-2 border-primary/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-candy flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Quiz images</h3>
                <p className="text-sm text-muted-foreground">Associe les images aux bons signes</p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-candy transition-all cursor-pointer border-2 border-accent/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🔗</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Relie les mots</h3>
                <p className="text-sm text-muted-foreground">Connecte les signes avec les mots</p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-candy transition-all cursor-pointer border-2 border-success/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-success flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📝</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Phrases mystères</h3>
                <p className="text-sm text-muted-foreground">Remets les signes dans l'ordre</p>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-candy transition-all cursor-pointer border-2 border-primary/50">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full gradient-candy flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">🎬</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Vidéos animées</h3>
                <p className="text-sm text-muted-foreground">Regarde et apprends en vidéo</p>
              </div>
            </Card>
          </div>

          <Card className="p-6 bg-primary/5 border-primary">
            <p className="text-center text-muted-foreground">
              Sélectionne un type d'exercice pour commencer à apprendre !
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};
