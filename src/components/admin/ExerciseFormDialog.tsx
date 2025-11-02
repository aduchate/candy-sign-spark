import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2 } from "lucide-react";

interface Exercise {
  id?: string;
  lesson_id: string;
  type: string;
  order_index: number;
  content: any;
}

interface ExerciseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exercise: Partial<Exercise> | null;
  lessonId: string;
  onSave: (exercise: Partial<Exercise>) => void;
}

export const ExerciseFormDialog = ({
  open,
  onOpenChange,
  exercise,
  lessonId,
  onSave,
}: ExerciseFormDialogProps) => {
  const [formData, setFormData] = useState<Partial<Exercise>>(
    exercise || { lesson_id: lessonId, type: "quiz", order_index: 0, content: {} }
  );

  useEffect(() => {
    if (exercise) {
      setFormData(exercise);
    } else {
      setFormData({ lesson_id: lessonId, type: "quiz", order_index: 0, content: {} });
    }
  }, [exercise, lessonId, open]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const renderQuizForm = () => {
    const questions = formData.content?.questions || [{ question: "", options: ["", "", "", ""], correctAnswer: 0 }];
    
    return (
      <div className="space-y-4">
        {questions.map((q: any, qIndex: number) => (
          <div key={qIndex} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Question {qIndex + 1}</Label>
              {questions.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const newQuestions = questions.filter((_: any, i: number) => i !== qIndex);
                    setFormData({ ...formData, content: { questions: newQuestions } });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Question"
              value={q.question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].question = e.target.value;
                setFormData({ ...formData, content: { questions: newQuestions } });
              }}
            />
            {q.options.map((option: string, oIndex: number) => (
              <div key={oIndex} className="flex items-center gap-2">
                <Input
                  placeholder={`Option ${oIndex + 1}`}
                  value={option}
                  onChange={(e) => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].options[oIndex] = e.target.value;
                    setFormData({ ...formData, content: { questions: newQuestions } });
                  }}
                />
                <input
                  type="radio"
                  checked={q.correctAnswer === oIndex}
                  onChange={() => {
                    const newQuestions = [...questions];
                    newQuestions[qIndex].correctAnswer = oIndex;
                    setFormData({ ...formData, content: { questions: newQuestions } });
                  }}
                />
              </div>
            ))}
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newQuestions = [...questions, { question: "", options: ["", "", "", ""], correctAnswer: 0 }];
            setFormData({ ...formData, content: { questions: newQuestions } });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une question
        </Button>
      </div>
    );
  };

  const renderFlashcardsForm = () => {
    const cards = formData.content?.cards || [{ word: "", videoUrl: "" }];
    
    return (
      <div className="space-y-4">
        {cards.map((card: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Carte {index + 1}</Label>
              {cards.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const newCards = cards.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, content: { cards: newCards } });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Mot"
              value={card.word}
              onChange={(e) => {
                const newCards = [...cards];
                newCards[index].word = e.target.value;
                setFormData({ ...formData, content: { cards: newCards } });
              }}
            />
            <Input
              placeholder="URL de la vidéo"
              value={card.videoUrl}
              onChange={(e) => {
                const newCards = [...cards];
                newCards[index].videoUrl = e.target.value;
                setFormData({ ...formData, content: { cards: newCards } });
              }}
            />
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newCards = [...cards, { word: "", videoUrl: "" }];
            setFormData({ ...formData, content: { cards: newCards } });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une carte
        </Button>
      </div>
    );
  };

  const renderMatchingForm = () => {
    const pairs = formData.content?.pairs || [{ word: "", videoUrl: "" }];
    
    return (
      <div className="space-y-4">
        {pairs.map((pair: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Paire {index + 1}</Label>
              {pairs.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const newPairs = pairs.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, content: { pairs: newPairs } });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Input
              placeholder="Mot"
              value={pair.word}
              onChange={(e) => {
                const newPairs = [...pairs];
                newPairs[index].word = e.target.value;
                setFormData({ ...formData, content: { pairs: newPairs } });
              }}
            />
            <Input
              placeholder="URL de la vidéo"
              value={pair.videoUrl}
              onChange={(e) => {
                const newPairs = [...pairs];
                newPairs[index].videoUrl = e.target.value;
                setFormData({ ...formData, content: { pairs: newPairs } });
              }}
            />
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newPairs = [...pairs, { word: "", videoUrl: "" }];
            setFormData({ ...formData, content: { pairs: newPairs } });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une paire
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {exercise?.id ? "Modifier l'exercice" : "Nouvel exercice"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>Type d'exercice</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => setFormData({ ...formData, type: value, content: {} })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="quiz">Quiz</SelectItem>
                <SelectItem value="flashcards">Flashcards</SelectItem>
                <SelectItem value="matching">Association</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Ordre</Label>
            <Input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
            />
          </div>

          <div>
            <Label>Contenu de l'exercice</Label>
            {formData.type === "quiz" && renderQuizForm()}
            {formData.type === "flashcards" && renderFlashcardsForm()}
            {formData.type === "matching" && renderMatchingForm()}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
