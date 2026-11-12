# Contribuer à Drissman

Ce guide s'adresse à toute personne qui rejoint le projet. Il explique comment lancer l'application en local, comment organiser son travail et ce qu'une Pull Request doit contenir pour être acceptée. La répartition des tâches est dans [docs/ROADMAP.md](docs/ROADMAP.md).

## 1. Ce qu'il faut savoir avant de commencer

- **Le dépôt contient deux applications** : `backend/` (Spring Boot 3, WebFlux, R2DBC, PostgreSQL, Liquibase) et `frontend/` (Next.js 15, App Router, Tailwind).
- **Une application mobile** (React Native / Expo) consomme le même backend. Elle vit dans un autre dépôt, `drissmanmobile/drissman-frontend`. Tout changement de contrat d'API doit être répercuté sur le front web **et** sur l'app mobile.
- **Le backend s'intègre au Kernel Yowyob** (comptes miroirs, paiement, comptabilité, fichiers…). Ces appels sont *best-effort* : si le Kernel est injoignable, l'application doit continuer à fonctionner. La seule exception est la connexion, bloquée tant que l'email n'est pas vérifié côté Kernel.
- **Production** : front sur `https://drisman.yowyob.com`, backend sur `https://drisman.yowyob.com/drissman-api` (domaine à un « s », chemin à deux « s »).

## 2. Branches : ne jamais travailler sur `main`

| Branche | Rôle |
|---|---|
| `main` | Code de production. **Un push sur `main` déclenche le déploiement** (pipeline GitLab). Seul le lead y fusionne, depuis `develop`. |
| `develop` | Branche d'intégration. **Toutes les PR la ciblent.** |
| `feat/…`, `fix/…`, `chore/…` | Une branche par tâche, créée depuis `develop`. Exemple : `feat/p2-2-seances-individuelles`. |

```bash
git checkout develop && git pull
git checkout -b feat/p2-2-seances-individuelles
```

Les commits suivent les [Conventional Commits](https://www.conventionalcommits.org/fr/) en français, par exemple `fix(paiement): …` ou `feat(seances): …`.

## 3. Lancer le projet en local

### Prérequis
- JDK 21 et Maven 3.9 (`mvnw.cmd` n'est pas fonctionnel : utilisez `mvn`).
- Node.js 22 ou plus récent.
- PostgreSQL 16 : soit installé nativement, soit via `docker compose -f backend/docker-compose.yml up -d postgres` (port **5433**, utilisateur `drissman`, mot de passe `drissman_secret`).

### Backend
```bash
cd backend
# Charge les données de démo (seeds taguées context:dev). Sans cette variable,
# le défaut est 'prod' : aucune donnée de démo.
export LIQUIBASE_CONTEXTS=dev
# IMPORTANT : en local, coupez le Kernel. Sinon chaque compte créé sur votre
# machine crée aussi un vrai compte miroir chez Yowyob.
export KERNEL_BASE_URL=http://127.0.0.1:9
mvn spring-boot:run
```
- Si votre PostgreSQL écoute sur le port **5432** (installation native), ajoutez `SPRING_R2DBC_URL=r2dbc:postgresql://127.0.0.1:5432/drissman` et `SPRING_DATASOURCE_URL=jdbc:postgresql://127.0.0.1:5432/drissman`.
- Le backend écoute sur `http://localhost:8080`, et `GET /api/health` doit répondre `UP`.
- Sous PowerShell, remplacez `export X=…` par `$env:X="…"`.

### Frontend
```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:8080
npm ci
npm run dev                  # http://localhost:3000
```

### Comptes de test
Créez-les via l'écran d'inscription : choisissez « Auto-école » pour un compte gérant, ou « Candidat ». Le compte Super Admin demande le code `SUPERADMIN_SECRET`, qui vaut `DRISSMAN_SUPER_SECRET` en local.

## 4. Règles de code

- **Base de données** : toute évolution du schéma passe par un **nouveau** changeset Liquibase, ajouté **en fin** de `db.changelog-master.yaml` et **numéroté à partir de `070`** (la base de prod contient déjà des identifiants `055` à `061` venus du dépôt mobile). Ne modifiez jamais un changeset déjà exécuté quelque part. Les données de démo et les opérations destructrices portent `context: dev`.
- **Secrets** : aucun mot de passe, clé d'API ni identifiant en dur, que ce soit dans le code, les migrations ou les tests. Tout passe par des variables d'environnement (voir `.env.example`).
- **Tests** : chaque règle métier ajoutée ou modifiée a son test unitaire (Mockito + `StepVerifier` côté backend, Vitest côté front).
- **Erreurs** : remontez le vrai message à l'utilisateur. Un `toast.error("Création impossible")` qui masque la cause rend tout diagnostic impossible.
- **Front** : appelez le backend via `lib/api-client.ts` et les services de `lib/`. N'ajoutez pas un énième calcul de l'URL d'API.

## 5. Ouvrir une Pull Request

1. Poussez votre branche et ouvrez la PR **vers `develop`**. Le modèle de PR se remplit automatiquement : complétez-le.
2. La CI GitHub (`.github/workflows/ci.yml`) doit être verte : tests backend, type-check, tests et build du front. Le lint est signalé sans bloquer pour l'instant.
3. Une relecture est obligatoire avant la fusion. Le lead valide, éventuellement assisté d'un agent de relecture.
4. Une PR = une tâche. Si une PR dépasse ~400 lignes modifiées hors tests, découpez-la.

## 6. Où trouver l'information

| Sujet | Document |
|---|---|
| Feuille de route, répartition, criticité | [docs/ROADMAP.md](docs/ROADMAP.md) |
| Contrat d'API | [docs/API_SPEC.md](docs/API_SPEC.md), [docs/MOBILE-API-CONTRACT.md](docs/MOBILE-API-CONTRACT.md) |
| Mode hors ligne | [docs/OFFLINE.md](docs/OFFLINE.md) |
| Variables de déploiement | [.env.example](.env.example) |
