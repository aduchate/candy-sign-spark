import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const onboardingSchema = z.object({
  age: z.coerce.number().min(1, "L'âge doit être supérieur à 0").max(120, "Veuillez entrer un âge valide"),
  status: z.enum(["travail", "etudiant", "ecolier", "retraite", "autre"], {
    required_error: "Veuillez sélectionner votre statut",
  }),
  hearing_status: z.enum(["entendant", "malentendant", "sourd"], {
    required_error: "Veuillez sélectionner votre statut auditif",
  }),
  profession: z.string().optional(),
  installation_reason: z.string().min(10, "Veuillez expliquer votre raison (minimum 10 caractères)"),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

export const OnboardingQuestionnaire = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedStatus = watch("status");

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          age: data.age,
          status: data.status,
          hearing_status: data.hearing_status,
          profession: data.status === "travail" ? data.profession : null,
          installation_reason: data.installation_reason,
          onboarding_completed: true,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Profil complété avec succès !");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Une erreur est survenue lors de la mise à jour de votre profil");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl">Bienvenue !</CardTitle>
          <CardDescription>
            Aidez-nous à personnaliser votre expérience en répondant à quelques questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Age */}
            <div className="space-y-2">
              <Label htmlFor="age">Âge</Label>
              <Input
                id="age"
                type="number"
                {...register("age")}
                placeholder="Entrez votre âge"
              />
              {errors.age && (
                <p className="text-sm text-destructive">{errors.age.message}</p>
              )}
            </div>

            {/* Statut */}
            <div className="space-y-2">
              <Label>Statut</Label>
              <RadioGroup onValueChange={(value) => register("status").onChange({ target: { value } })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="travail" id="travail" {...register("status")} />
                  <Label htmlFor="travail" className="font-normal cursor-pointer">Travail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="etudiant" id="etudiant" {...register("status")} />
                  <Label htmlFor="etudiant" className="font-normal cursor-pointer">Étudiant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ecolier" id="ecolier" {...register("status")} />
                  <Label htmlFor="ecolier" className="font-normal cursor-pointer">Écolier</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retraite" id="retraite" {...register("status")} />
                  <Label htmlFor="retraite" className="font-normal cursor-pointer">Retraité</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autre" id="autre" {...register("status")} />
                  <Label htmlFor="autre" className="font-normal cursor-pointer">Autre</Label>
                </div>
              </RadioGroup>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            {/* Profession (si travail) */}
            {selectedStatus === "travail" && (
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Input
                  id="profession"
                  {...register("profession")}
                  placeholder="Entrez votre profession"
                />
                {errors.profession && (
                  <p className="text-sm text-destructive">{errors.profession.message}</p>
                )}
              </div>
            )}

            {/* Statut auditif */}
            <div className="space-y-2">
              <Label>Statut auditif</Label>
              <RadioGroup onValueChange={(value) => register("hearing_status").onChange({ target: { value } })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entendant" id="entendant" {...register("hearing_status")} />
                  <Label htmlFor="entendant" className="font-normal cursor-pointer">Entendant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="malentendant" id="malentendant" {...register("hearing_status")} />
                  <Label htmlFor="malentendant" className="font-normal cursor-pointer">Malentendant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sourd" id="sourd" {...register("hearing_status")} />
                  <Label htmlFor="sourd" className="font-normal cursor-pointer">Sourd</Label>
                </div>
              </RadioGroup>
              {errors.hearing_status && (
                <p className="text-sm text-destructive">{errors.hearing_status.message}</p>
              )}
            </div>

            {/* Raison d'installation */}
            <div className="space-y-2">
              <Label htmlFor="installation_reason">
                Pourquoi avez-vous installé cette application ?
              </Label>
              <Textarea
                id="installation_reason"
                {...register("installation_reason")}
                placeholder="Partagez-nous votre motivation..."
                rows={4}
              />
              {errors.installation_reason && (
                <p className="text-sm text-destructive">{errors.installation_reason.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Commencer"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
