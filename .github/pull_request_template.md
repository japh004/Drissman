## Quoi et pourquoi

<!-- Que change cette PR, et pour quelle raison métier ? Lien vers la tâche de docs/ROADMAP.md (ex. P2.3). -->

Tâche : 

## Comment tester

<!-- Étapes concrètes pour vérifier le changement (compte, écran, requête…). -->

1. 

## Contrat d'API

- [ ] Aucun changement de contrat (routes, DTO, codes d'erreur)
- [ ] Le contrat change, et le front web **et** l'app mobile sont mis à jour dans cette PR (ou une PR liée : …)

## Base de données

- [ ] Aucune migration
- [ ] Nouvelle migration Liquibase **ajoutée en fin** du master, jamais de modification d'un changeset déjà exécuté
- [ ] Les données de démo ou destructrices sont taguées `context: dev`

## Checklist

- [ ] La PR cible `develop` (jamais `main` directement)
- [ ] `mvn test` passe ; chaque règle métier ajoutée ou modifiée a son test
- [ ] `npx tsc --noEmit` et `npm run build` passent (frontend)
- [ ] Aucun secret, identifiant ou mot de passe dans le code ni dans les migrations
- [ ] Les erreurs sont remontées à l'utilisateur (pas de toast générique qui masque la cause)
