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
    exercise || { lesson_id: lessonId, type: "true_false", order_index: 0, content: {} }
  );

  useEffect(() => {
    if (exercise) {
      setFormData(exercise);
    } else {
      setFormData({ lesson_id: lessonId, type: "true_false", order_index: 0, content: {} });
    }
  }, [exercise, lessonId, open]);

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const renderTrueFalseForm = () => {
    const questions = formData.content?.questions || [{ question: "", correctAnswer: true }];
    
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
            <Textarea
              placeholder="Question"
              value={q.question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].question = e.target.value;
                setFormData({ ...formData, content: { questions: newQuestions } });
              }}
            />
            <div className="flex items-center gap-4">
              <Label>Réponse correcte:</Label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={q.correctAnswer === true}
                    onChange={() => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].correctAnswer = true;
                      setFormData({ ...formData, content: { questions: newQuestions } });
                    }}
                  />
                  Vrai
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={q.correctAnswer === false}
                    onChange={() => {
                      const newQuestions = [...questions];
                      newQuestions[qIndex].correctAnswer = false;
                      setFormData({ ...formData, content: { questions: newQuestions } });
                    }}
                  />
                  Faux
                </label>
              </div>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newQuestions = [...questions, { question: "", correctAnswer: true }];
            setFormData({ ...formData, content: { questions: newQuestions } });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une question
        </Button>
      </div>
    );
  };

  const renderMultipleChoiceForm = () => {
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
            <Textarea
              placeholder="Question"
              value={q.question}
              onChange={(e) => {
                const newQuestions = [...questions];
                newQuestions[qIndex].question = e.target.value;
                setFormData({ ...formData, content: { questions: newQuestions } });
              }}
            />
            <div className="space-y-2">
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
                  <label className="flex items-center gap-1">
                    <input
                      type="radio"
                      checked={q.correctAnswer === oIndex}
                      onChange={() => {
                        const newQuestions = [...questions];
                        newQuestions[qIndex].correctAnswer = oIndex;
                        setFormData({ ...formData, content: { questions: newQuestions } });
                      }}
                    />
                    <span className="text-sm text-muted-foreground">Correcte</span>
                  </label>
                  {q.options.length > 2 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        const newQuestions = [...questions];
                        newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_: string, i: number) => i !== oIndex);
                        if (newQuestions[qIndex].correctAnswer >= oIndex) {
                          newQuestions[qIndex].correctAnswer = Math.max(0, newQuestions[qIndex].correctAnswer - 1);
                        }
                        setFormData({ ...formData, content: { questions: newQuestions } });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const newQuestions = [...questions];
                  newQuestions[qIndex].options.push("");
                  setFormData({ ...formData, content: { questions: newQuestions } });
                }}
              >
                <Plus className="w-4 h-4 mr-2" />
                Ajouter une option
              </Button>
            </div>
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

  const renderSentenceOrderingForm = () => {
    const sentences = formData.content?.sentences || [{ text: "", correctOrder: 0 }];
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Ajoutez des phrases que l'utilisateur devra réordonner dans le bon ordre.
        </p>
        {sentences.map((sentence: any, index: number) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <Label>Phrase {index + 1}</Label>
              {sentences.length > 1 && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const newSentences = sentences.filter((_: any, i: number) => i !== index);
                    setFormData({ ...formData, content: { sentences: newSentences } });
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <Textarea
              placeholder="Texte de la phrase"
              value={sentence.text}
              onChange={(e) => {
                const newSentences = [...sentences];
                newSentences[index].text = e.target.value;
                setFormData({ ...formData, content: { sentences: newSentences } });
              }}
            />
            <div className="flex items-center gap-2">
              <Label className="text-sm">Position correcte:</Label>
              <Input
                type="number"
                min="0"
                value={sentence.correctOrder}
                onChange={(e) => {
                  const newSentences = [...sentences];
                  newSentences[index].correctOrder = parseInt(e.target.value);
                  setFormData({ ...formData, content: { sentences: newSentences } });
                }}
                className="w-20"
              />
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          onClick={() => {
            const newSentences = [...sentences, { text: "", correctOrder: sentences.length }];
            setFormData({ ...formData, content: { sentences: newSentences } });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une phrase
        </Button>
      </div>
    );
  };

  const renderAssociationForm = () => {
    const pairs = formData.content?.pairs || [{ word: "", videoUrl: "" }];
    
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Créez des paires mot-vidéo que l'utilisateur devra associer.
        </p>
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
                <SelectItem value="true_false">Vrai/Faux</SelectItem>
                <SelectItem value="multiple_choice">Choix Multiple</SelectItem>
                <SelectItem value="sentence_ordering">Réordonner des Phrases</SelectItem>
                <SelectItem value="association">Association</SelectItem>
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
            {formData.type === "true_false" && renderTrueFalseForm()}
            {formData.type === "multiple_choice" && renderMultipleChoiceForm()}
            {formData.type === "sentence_ordering" && renderSentenceOrderingForm()}
            {formData.type === "association" && renderAssociationForm()}
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
