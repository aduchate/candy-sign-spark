import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      "app": {
        "name": "SignaccesS"
      },
      "common": {
        "back": "Retour au tableau de bord",
        "logout": "Déconnexion",
        "stats": "Statistiques",
        "loading": "Chargement..."
      },
      "auth": {
        "welcomeBack": "Bon retour !",
        "startJourney": "Commencez votre voyage LSFB",
        "email": "Email",
        "password": "Mot de passe",
        "signIn": "Se connecter",
        "signUp": "S'inscrire",
        "noAccount": "Vous n'avez pas de compte ? ",
        "haveAccount": "Vous avez déjà un compte ? ",
        "pleaseWait": "Veuillez patienter...",
        "invalidCredentials": "Email ou mot de passe invalide",
        "emailRegistered": "Cet email est déjà enregistré. Veuillez vous connecter.",
        "accountCreated": "Compte créé ! Bienvenue sur SignLearn ! 🎉",
        "welcomeBackMessage": "Bon retour ! 🎉",
        "forgotPassword": "Mot de passe oublié ?",
        "forgotPasswordTitle": "Réinitialiser le mot de passe",
        "sendResetLink": "Envoyer le lien de réinitialisation",
        "resetEmailSent": "Un email de réinitialisation a été envoyé. Vérifiez votre boîte de réception.",
        "backToLogin": "Retour à la connexion",
        "invalidEmail": "Veuillez entrer une adresse email valide.",
        "resetPasswordTitle": "Nouveau mot de passe",
        "newPassword": "Nouveau mot de passe",
        "confirmPassword": "Confirmer le mot de passe",
        "updatePassword": "Mettre à jour le mot de passe",
        "passwordTooShort": "Le mot de passe doit contenir au moins 6 caractères.",
        "passwordsMismatch": "Les mots de passe ne correspondent pas.",
        "passwordUpdated": "Mot de passe mis à jour ! Vous pouvez maintenant vous connecter.",
        "invalidLink": "Lien invalide",
        "invalidLinkMessage": "Ce lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien."
      },
      "dashboard": {
        "welcome": "Bon retour, {{name}} ! 👋",
        "keepStreak": "Continuez votre série !",
        "dayStreak": "jours de série",
        "learningPath": "Votre parcours d'apprentissage",
        "start": "Commencer",
        "continue": "Continuer",
        "review": "Réviser",
        "locked": "🔒",
        "signedOut": "Déconnexion réussie"
      },
      "lesson": {
        "question": "{{current}} / {{total}}",
        "displayVideo": "Afficher la vidéo",
        "videoHelp": "Voici comment signer correctement",
        "nextQuestion": "Question suivante",
        "completeLesson": "Terminer la leçon",
        "correct": "Correct ! Bien joué ! 🎉",
        "incorrect": "Pas tout à fait ! Réessayez la prochaine fois.",
        "lessonComplete": "Leçon terminée ! Score : {{score}}/{{total}} 🎊"
      },
      "stats": {
        "title": "Vos progrès",
        "totalXP": "XP Total",
        "dayStreak": "Série de jours",
        "accuracy": "Précision",
        "weeklyActivity": "Activité hebdomadaire",
        "achievements": "Réalisations",
        "personalBests": "Records personnels",
        "longestStreak": "Plus longue série",
        "lessonsCompleted": "Leçons terminées",
        "bestAccuracy": "Meilleure précision",
        "days": "jours",
        "badges": {
          "firstLesson": "Première leçon",
          "weekWarrior": "Guerrier de la semaine",
          "quickLearner": "Apprenant rapide",
          "perfectScore": "Score parfait",
          "monthMaster": "Maître du mois",
          "signExpert": "Expert en signes"
        }
      },
      "lessons": {},
      "notFound": {
        "title": "404",
        "message": "Oups ! Page non trouvée",
        "returnHome": "Retour à l'accueil"
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
