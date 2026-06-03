## Supprimer la section « Liens utiles »

### Portée
Retirer entièrement la section « Liens utiles » du tableau de bord.

### Changements
1. **Supprimer le composant** `src/components/UsefulLinks.tsx`.
2. **Nettoyer `src/pages/Dashboard.tsx`** :
   - Retirer l'import de `UsefulLinks`.
   - Retirer le bouton « Liens utiles » dans la sidebar (sous « Patient signant »).
   - Retirer `"liens"` du type union de `activeSection` et de `sectionParam`.
   - Retirer le rendu conditionnel `{activeSection === "liens" && <UsefulLinks />}`.
   - Retirer le titre d'en-tête correspondant à `"liens"`.

Aucune autre route ou page n'est concernée.