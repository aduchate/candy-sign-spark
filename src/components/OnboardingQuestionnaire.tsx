import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useLogopedists, logopedistLabel } from "@/hooks/useLogopedists";

const onboardingSchema = z.object({
  age: z.coerce.number().min(1, "L'âge doit être supérieur à 0").max(120, "Veuillez entrer un âge valide"),
  status: z.enum(["travail", "etudiant", "ecolier", "retraite", "autre"], {
    required_error: "Veuillez sélectionner votre statut",
  }),
  hearing_status: z.enum(["entendant", "malentendant", "sourd"], {
    required_error: "Veuillez sélectionner votre statut auditif",
  }),
  account_type: z.enum(["pro", "patient"], {
    required_error: "Veuillez sélectionner un type de compte",
  }),
  profession: z.string().optional(),
  // Required for patients (enforced in onSubmit, where the available-pro list is
  // known: patients are not blocked when no logopedist exists yet).
  logopedist_id: z.string().optional(),
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
    setValue,
    setError,
    reset,
    formState: { errors },
  } = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
  });

  const selectedStatus = watch("status");
  const selectedAccountType = watch("account_type");
  const { logopedists, loading: loadingLogopedists } = useLogopedists();

  useEffect(() => {
    const loadExistingProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("age, status, hearing_status, profession, installation_reason, account_type, logopedist_id")
        .eq("id", user.id)
        .single();

      if (!profile) return;

      // Prefill all known fields, including the previously chosen account type.
      reset({
        age: profile.age ?? undefined,
        status: (profile.status as OnboardingFormData["status"]) ?? undefined,
        hearing_status: (profile.hearing_status as OnboardingFormData["hearing_status"]) ?? undefined,
        profession: profile.profession ?? undefined,
        installation_reason: profile.installation_reason ?? undefined,
        account_type: (profile.account_type as OnboardingFormData["account_type"]) ?? undefined,
        logopedist_id: profile.logopedist_id ?? undefined,
      });
    };

    loadExistingProfile();
  }, [reset]);

  const onSubmit = async (data: OnboardingFormData) => {
    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Vous devez être connecté");
        navigate("/auth");
        return;
      }

      const isPatient = data.account_type === "patient";

      // A patient must pick a logopedist — but only when at least one pro exists
      // (otherwise they'd be locked out; they get re-prompted at next login).
      if (isPatient && logopedists.length > 0 && !data.logopedist_id) {
        setError("logopedist_id", {
          type: "manual",
          message: "Veuillez sélectionner votre logopède",
        });
        setIsSubmitting(false);
        return;
      }

      // account_type is written atomically with the rest of the profile, so it
      // can never half-succeed (the old role-RPC path could).
      const { error } = await supabase
        .from("profiles")
        .update({
          age: data.age,
          status: data.status,
          hearing_status: data.hearing_status,
          profession: (data.status === "travail" || data.status === "retraite" || data.status === "autre") ? data.profession : null,
          installation_reason: data.installation_reason,
          account_type: data.account_type,
          logopedist_id: isPatient ? (data.logopedist_id || null) : null,
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
              <RadioGroup value={selectedStatus} onValueChange={(value) => setValue("status", value as OnboardingFormData["status"], { shouldValidate: true })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="travail" id="travail" />
                  <Label htmlFor="travail" className="font-normal cursor-pointer">Travail</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="etudiant" id="etudiant" />
                  <Label htmlFor="etudiant" className="font-normal cursor-pointer">Étudiant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ecolier" id="ecolier" />
                  <Label htmlFor="ecolier" className="font-normal cursor-pointer">Écolier</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="retraite" id="retraite" />
                  <Label htmlFor="retraite" className="font-normal cursor-pointer">Retraité</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="autre" id="autre" />
                  <Label htmlFor="autre" className="font-normal cursor-pointer">Autre</Label>
                </div>
              </RadioGroup>
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
              )}
            </div>

            {/* Profession (si travail) */}
            {(selectedStatus === "travail" || selectedStatus === "retraite" || selectedStatus === "autre") && (
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
              <RadioGroup value={watch("hearing_status")} onValueChange={(value) => setValue("hearing_status", value as OnboardingFormData["hearing_status"], { shouldValidate: true })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="entendant" id="entendant" />
                  <Label htmlFor="entendant" className="font-normal cursor-pointer">Entendant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="malentendant" id="malentendant" />
                  <Label htmlFor="malentendant" className="font-normal cursor-pointer">Malentendant</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sourd" id="sourd" />
                  <Label htmlFor="sourd" className="font-normal cursor-pointer">Sourd</Label>
                </div>
              </RadioGroup>
              {errors.hearing_status && (
                <p className="text-sm text-destructive">{errors.hearing_status.message}</p>
              )}
            </div>

            {/* Type de compte */}
            <div className="space-y-2">
              <Label>Type de compte</Label>
              <RadioGroup
                value={watch("account_type")}
                onValueChange={(value) =>
                  setValue("account_type", value as OnboardingFormData["account_type"], {
                    shouldValidate: true,
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="pro" id="account_pro" />
                  <Label htmlFor="account_pro" className="font-normal cursor-pointer">
                    Pro de santé
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="patient" id="account_patient" />
                  <Label htmlFor="account_patient" className="font-normal cursor-pointer">
                    Patient signant
                  </Label>
                </div>
              </RadioGroup>
              {errors.account_type && (
                <p className="text-sm text-destructive">{errors.account_type.message}</p>
              )}
            </div>

            {/* Logopède (uniquement pour les patients) */}
            {selectedAccountType === "patient" && (
              <div className="space-y-2">
                <Label htmlFor="logopedist">Mon·ma logopède</Label>
                {loadingLogopedists ? (
                  <p className="text-sm text-muted-foreground">Chargement des logopèdes...</p>
                ) : logopedists.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Aucun·e logopède n'est disponible pour le moment. Vous pourrez en
                    sélectionner un·e plus tard.
                  </p>
                ) : (
                  <Select
                    value={watch("logopedist_id") ?? ""}
                    onValueChange={(value) =>
                      setValue("logopedist_id", value, { shouldValidate: true })
                    }
                  >
                    <SelectTrigger id="logopedist">
                      <SelectValue placeholder="Sélectionnez votre logopède" />
                    </SelectTrigger>
                    <SelectContent>
                      {logopedists.map((logopedist) => (
                        <SelectItem key={logopedist.id} value={logopedist.id}>
                          {logopedistLabel(logopedist)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {errors.logopedist_id && (
                  <p className="text-sm text-destructive">{errors.logopedist_id.message}</p>
                )}
              </div>
            )}

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
