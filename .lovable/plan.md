## Problème

Malgré les changements précédents dans `Auth.tsx` et `Index.tsx`, le `Dashboard.tsx` contient encore une vérification (lignes ~108-113) qui redirige tout utilisateur dont `onboarding_completed` est `false` vers `/onboarding`. C'est pourquoi le questionnaire s'affiche à chaque connexion, même pour des comptes existants.

## Correction

**`src/pages/Dashboard.tsx`** : retirer le bloc qui lit `onboarding_completed` et fait `navigate("/onboarding")`. Garder uniquement la vérification de session (rediriger vers `/auth` si non connecté) et la lecture des autres champs nécessaires (`age`, `status`, etc.) sans bloquer l'accès.

## Comportement résultant

- **Nouvel utilisateur (signup)** : `Auth.tsx` redirige vers `/onboarding` après création du compte → questionnaire affiché une seule fois.
- **Utilisateur existant (login)** : va directement sur `/dashboard`, peu importe `onboarding_completed`.
- Le questionnaire reste accessible manuellement via `/onboarding` ou depuis le profil si besoin.
