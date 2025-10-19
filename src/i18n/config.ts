import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app": {
        "name": "SignLearn"
      },
      "common": {
        "back": "Back to Dashboard",
        "logout": "Logout",
        "stats": "Stats",
        "loading": "Loading..."
      },
      "auth": {
        "welcomeBack": "Welcome back!",
        "startJourney": "Start your LSFB journey",
        "email": "Email",
        "password": "Password",
        "signIn": "Sign In",
        "signUp": "Sign Up",
        "noAccount": "Don't have an account? ",
        "haveAccount": "Already have an account? ",
        "pleaseWait": "Please wait...",
        "invalidCredentials": "Invalid email or password",
        "emailRegistered": "This email is already registered. Please login instead.",
        "accountCreated": "Account created! Welcome to SignLearn! 🎉",
        "welcomeBackMessage": "Welcome back! 🎉"
      },
      "dashboard": {
        "welcome": "Welcome back, {{name}}! 👋",
        "keepStreak": "Keep up your streak!",
        "dayStreak": "day streak",
        "learningPath": "Your Learning Path",
        "start": "Start",
        "continue": "Continue",
        "review": "Review",
        "locked": "🔒",
        "signedOut": "Signed out successfully"
      },
      "lesson": {
        "question": "{{current}} / {{total}}",
        "displayVideo": "Display Video",
        "videoHelp": "This is how to sign it correctly",
        "nextQuestion": "Next Question",
        "completeLesson": "Complete Lesson",
        "correct": "Correct! Well done! 🎉",
        "incorrect": "Not quite! Try again next time.",
        "lessonComplete": "Lesson complete! Score: {{score}}/{{total}} 🎊"
      },
      "stats": {
        "title": "Your Progress",
        "totalXP": "Total XP",
        "dayStreak": "Day Streak",
        "accuracy": "Accuracy",
        "weeklyActivity": "Weekly Activity",
        "achievements": "Achievements",
        "personalBests": "Personal Bests",
        "longestStreak": "Longest Streak",
        "lessonsCompleted": "Lessons Completed",
        "bestAccuracy": "Best Accuracy",
        "days": "days",
        "badges": {
          "firstLesson": "First Lesson",
          "weekWarrior": "Week Warrior",
          "quickLearner": "Quick Learner",
          "perfectScore": "Perfect Score",
          "monthMaster": "Month Master",
          "signExpert": "Sign Expert"
        }
      },
      "lessons": {
        "basicGreetings": {
          "title": "Basic Greetings",
          "q1": {
            "question": "What is the sign for 'Hello'?",
            "options": ["Wave hand", "Thumbs up", "Clap hands", "Point up"]
          },
          "q2": {
            "question": "How do you sign 'Thank you'?",
            "options": ["Wave", "Bow", "Touch chin then forward", "Clap"]
          },
          "q3": {
            "question": "What does this sign mean?",
            "options": ["Good", "Yes", "Okay", "All of the above"]
          }
        },
        "familySigns": {
          "title": "Family Signs",
          "q1": {
            "question": "What is the sign for 'Mother'?",
            "options": ["Point to head", "Touch chin", "Wave hand", "Touch chest"]
          },
          "q2": {
            "question": "How do you sign 'Father'?",
            "options": ["Touch forehead", "Touch nose", "Wave hand", "Point up"]
          },
          "q3": {
            "question": "What does this sign mean?",
            "options": ["Child", "Baby", "Small", "Young"]
          }
        },
        "colorsNumbers": {
          "title": "Colors & Numbers",
          "q1": {
            "question": "What is the sign for 'Red'?",
            "options": ["Touch lips", "Point to sky", "Touch nose", "Wave hand"]
          },
          "q2": {
            "question": "How do you sign the number '5'?",
            "options": ["Open hand", "Closed fist", "Two fingers", "Three fingers"]
          },
          "q3": {
            "question": "What color is this sign for?",
            "options": ["Green", "Blue", "Yellow", "Purple"]
          }
        },
        "dailyActivities": {
          "title": "Daily Activities",
          "q1": {
            "question": "What is the sign for 'Eat'?",
            "options": ["Hand to mouth", "Rub stomach", "Point to plate", "Open mouth"]
          },
          "q2": {
            "question": "How do you sign 'Sleep'?",
            "options": ["Hands together near face", "Close eyes", "Lay down motion", "Yawn"]
          },
          "q3": {
            "question": "What does this sign mean?",
            "options": ["Walk", "Run", "Jump", "Dance"]
          }
        }
      },
      "notFound": {
        "title": "404",
        "message": "Oops! Page not found",
        "returnHome": "Return to Home"
      }
    }
  },
  fr: {
    translation: {
      "app": {
        "name": "SignLearn"
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
        "welcomeBackMessage": "Bon retour ! 🎉"
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
      "lessons": {
        "basicGreetings": {
          "title": "Salutations de base",
          "q1": {
            "question": "Quel est le signe pour 'Bonjour' ?",
            "options": ["Agiter la main", "Pouce levé", "Applaudir", "Pointer vers le haut"]
          },
          "q2": {
            "question": "Comment signer 'Merci' ?",
            "options": ["Agiter", "S'incliner", "Toucher le menton puis l'avant", "Applaudir"]
          },
          "q3": {
            "question": "Que signifie ce signe ?",
            "options": ["Bien", "Oui", "D'accord", "Toutes ces réponses"]
          }
        },
        "familySigns": {
          "title": "Signes de la famille",
          "q1": {
            "question": "Quel est le signe pour 'Mère' ?",
            "options": ["Pointer la tête", "Toucher le menton", "Agiter la main", "Toucher la poitrine"]
          },
          "q2": {
            "question": "Comment signer 'Père' ?",
            "options": ["Toucher le front", "Toucher le nez", "Agiter la main", "Pointer vers le haut"]
          },
          "q3": {
            "question": "Que signifie ce signe ?",
            "options": ["Enfant", "Bébé", "Petit", "Jeune"]
          }
        },
        "colorsNumbers": {
          "title": "Couleurs et nombres",
          "q1": {
            "question": "Quel est le signe pour 'Rouge' ?",
            "options": ["Toucher les lèvres", "Pointer le ciel", "Toucher le nez", "Agiter la main"]
          },
          "q2": {
            "question": "Comment signer le nombre '5' ?",
            "options": ["Main ouverte", "Poing fermé", "Deux doigts", "Trois doigts"]
          },
          "q3": {
            "question": "De quelle couleur est ce signe ?",
            "options": ["Vert", "Bleu", "Jaune", "Violet"]
          }
        },
        "dailyActivities": {
          "title": "Activités quotidiennes",
          "q1": {
            "question": "Quel est le signe pour 'Manger' ?",
            "options": ["Main à la bouche", "Frotter l'estomac", "Pointer l'assiette", "Ouvrir la bouche"]
          },
          "q2": {
            "question": "Comment signer 'Dormir' ?",
            "options": ["Mains jointes près du visage", "Fermer les yeux", "Mouvement de s'allonger", "Bâiller"]
          },
          "q3": {
            "question": "Que signifie ce signe ?",
            "options": ["Marcher", "Courir", "Sauter", "Danser"]
          }
        }
      },
      "notFound": {
        "title": "404",
        "message": "Oups ! Page non trouvée",
        "returnHome": "Retour à l'accueil"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
