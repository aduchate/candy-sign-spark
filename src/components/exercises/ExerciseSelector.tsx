import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, HelpCircle, Link2 } from "lucide-react";

interface ExerciseSelectorProps {
  onSelectExercise: (type: "flashcards" | "quiz" | "matching") => void;
  onBack?: () => void;
  isChildMode?: boolean;
}

export const ExerciseSelector = ({ onSelectExercise, onBack, isChildMode = false }: ExerciseSelectorProps) => {
  return (
    <div className="space-y-6">
      {onBack && (
        <Button variant="ghost" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
      )}

      <div className="text-center mb-8">
        <h2 className={`text-3xl font-bold mb-2 ${isChildMode ? "bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent" : ""}`}>
          {isChildMode ? "Choisis ton exercice ! 🎮" : "Choisissez un type d'exercice"}
        </h2>
        <p className="text-muted-foreground">
          {isChildMode
            ? "Quelle activité veux-tu faire aujourd'hui ?"
            : "Sélectionnez le type d'exercice pour pratiquer"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          className={`p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 ${
            isChildMode ? "border-4 border-primary/50" : "border-2"
          }`}
          onClick={() => onSelectExercise("flashcards")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full ${isChildMode ? "gradient-candy" : "bg-primary/20"} flex items-center justify-center mb-4`}>
              <CreditCard className={`w-10 h-10 ${isChildMode ? "text-primary-foreground" : "text-primary"}`} />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {isChildMode ? "Cartes Magiques 🎴" : "Flash Cards"}
            </h3>
            <p className="text-muted-foreground">
              {isChildMode
                ? "Retourne les cartes pour voir les signes !"
                : "Pratiquez avec des cartes recto-verso"}
            </p>
          </div>
        </Card>

        <Card
          className={`p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 ${
            isChildMode ? "border-4 border-accent/50" : "border-2"
          }`}
          onClick={() => onSelectExercise("quiz")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full ${isChildMode ? "gradient-accent" : "bg-accent/20"} flex items-center justify-center mb-4`}>
              <HelpCircle className={`w-10 h-10 ${isChildMode ? "text-accent-foreground" : "text-accent"}`} />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {isChildMode ? "Quiz Rigolo 🎯" : "Quiz"}
            </h3>
            <p className="text-muted-foreground">
              {isChildMode
                ? "Trouve le bon signe parmi plusieurs choix !"
                : "Testez vos connaissances avec un quiz"}
            </p>
          </div>
        </Card>

        <Card
          className={`p-8 cursor-pointer hover:shadow-candy transition-all hover:scale-105 ${
            isChildMode ? "border-4 border-success/50" : "border-2"
          }`}
          onClick={() => onSelectExercise("matching")}
        >
          <div className="flex flex-col items-center text-center">
            <div className={`w-20 h-20 rounded-full ${isChildMode ? "gradient-success" : "bg-success/20"} flex items-center justify-center mb-4`}>
              <Link2 className={`w-10 h-10 ${isChildMode ? "text-success-foreground" : "text-success"}`} />
            </div>
            <h3 className="text-2xl font-bold mb-2">
              {isChildMode ? "Jeu des Paires 🔗" : "Appariement"}
            </h3>
            <p className="text-muted-foreground">
              {isChildMode
                ? "Relie les lettres/chiffres avec leurs signes !"
                : "Associez les lettres/chiffres avec les signes"}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};