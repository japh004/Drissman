# Feuille de route Drissman — reprise du projet

*Établie le 12/11/2026. Ce document fait référence pour savoir qui fait quoi, dans quel ordre et avec quelle priorité. Il évolue : chaque PR qui termine une tâche coche la ligne correspondante.*

## 1. Où en est le projet

- **Deux backends ont coexisté.** L'équipe web a construit un backend (dernière version web pure : `f9069cf`, 24/07/2026). L'équipe mobile l'a forké, puis a fusionné son fork dans ce dépôt le 29/07 (`5360e1b`). **La prod tourne sur le backend mobile**, dont le métier est aujourd'hui identique à celui de ce dépôt.
- **Décision : un seul dépôt, celui-ci.** Le dépôt `drissmanmobile/backend` n'est plus maintenu. Ses migrations `059` à `061` (purges massives, Super Admin codé en dur) ne doivent **jamais** être portées ni redéployées.
- **La fusion mobile a changé des règles métier.** Les arbitrages ci-dessous fixent ce qu'on garde.
- **Phase 1 (socle) faite** sur `chore/phase1-socle` :
  - CI verte (25/25) ;
  - webhook de paiement sécurisé ;
  - faux 502 Mobile Money corrigé ;
  - garde-fous de sécurité et de Liquibase rétablis ;
  - CI de PR, guide de contribution, nettoyage du dépôt.

### Arbitrages métier (décidés, non négociables sans le lead)

| Domaine | Modèle retenu |
|---|---|
| Séances | **Web** : une séance = un élève (son inscription), un moniteur. Contrôle des heures restantes à la création, débit sur l'élève seul à la clôture. L'élève ne voit que ses séances. Les séances collectives existantes sont **archivées**. |
| Durée d'une séance | Arrondie à l'heure la plus proche, **minimum 1 h**. Même règle pour le contrôle et le débit. Fin ≤ début refusée. |
| Paiement | **Mobile** (passerelle Kernel unifiée Stripe / MyCoolPay), avec en plus : confirmation manuelle par le gérant, espèces (CASH) sans passerelle, aucune nouvelle tentative sans vérifier l'ancienne. |
| Rôles | `VISITOR` → `CANDIDAT` → **`STUDENT` seulement après paiement**. Pas d'auto-inscription en `MONITOR` : c'est le gérant qui crée les moniteurs. |
| Connexion | **Mobile** : bloquée tant que l'email n'est pas vérifié côté Kernel. Login **Google** disponible aussi sur le web. |
| Kernel | **Modèle A** : une seule organisation Kernel (Drissman). Les auto-écoles ne sont pas des organisations Kernel. |
| Ajouts du mobile | Gardés s'ils sont cohérents avec le web et le Kernel, retirés sinon (voir lots). |

## 2. Indice de criticité

| Indice | Signification | Quand |
|---|---|---|
| 🔴 **C1, critique** | Touche à l'argent, aux données, à la sécurité, ou bloque d'autres tâches. Une erreur coûte cher. | En premier, relecture renforcée du lead |
| 🟠 **C2, important** | Règle métier ou fonction attendue par les utilisateurs. | Après les C1 du même domaine |
| 🟢 **C3, confort** | Complétude, ergonomie, dette technique. | En fin de vague, ou reporté si le temps manque |

## 3. Répartition

L'équipe compte **trois personnes** : David (lead), Japhet et Owen. Chacun possède un domaine et prend aussi les **finitions** (F.x, ex-bloc niveau 4, abandonné) qui touchent ce domaine, pour ne pas multiplier les fichiers partagés. **Règle mobile** : celui qui change un contrat d'API met aussi à jour l'app mobile (`drissmanmobile/drissman-frontend`), dans une PR liée.

### David — lead (chef de projet)

Rôle de lead : relire et valider **toutes** les PR, fusionner `develop` → `main` (donc déployer), être l'interlocuteur du DevOps et de l'admin Yowyob, arbitrer le métier.

| ID | Tâche | Crit. | Dépend de |
|---|---|---|---|
| P1.1 | Valider la PR du socle et la fusionner dans `develop` ; protéger `main` et `develop` (PR + CI verte obligatoires) | 🔴 | — |
| P1.2 | Obtenir du DevOps le **chemin de déploiement réel** : dépôt, compose, nom du conteneur, variables du `.env` de prod | 🔴 | — |
| P1.3 | Aligner `docker-compose.prod.yml` et la CI GitLab sur la réalité du VPS : `Host(drisman.yowyob.com)`, callback `/drissman-api`, service frontend | 🔴 | P1.2 |
| P1.4 | Retirer les secrets par défaut de `application.properties` ; faire révoquer la clé Kernel compromise `prod-platform-backend` | 🔴 | P1.2 |
| P1.5 | « **Aucune création ne marche en prod** » — *diagnostiqué* : la prod répond `400 « The mapper … returned a null value »`, car le compte gérant a `school_id = NULL`. Origine probable : les migrations du dépôt mobile `059` (`UPDATE users SET school_id = NULL` sur **tous** les comptes, puis suppression de toutes les écoles) ou `060` (gérant `schooladmin@drissman.com` créé sans école). Correctif de code fait (message 403 clair « Compte non associé à une école »). **Reste** : avec le DevOps, lister les gérants sans école (`SELECT id, email FROM users WHERE role='SCHOOL_ADMIN' AND school_id IS NULL`) et les rattacher à leur école ou leur en créer une ; relever `SELECT id, dateexecuted FROM databasechangelog WHERE id LIKE '05%' OR id LIKE '06%'` pour savoir quelles purges ont tourné. | 🔴 | P1.2 |
| P1.6 | **Comptes injectés par migration en prod** : `060` crée un `SUPER_ADMIN` `admin@drissman.com` et un gérant `schooladmin@drissman.com` avec un hash de mot de passe versionné dans un dépôt. Les supprimer ou changer leur mot de passe en prod, et vérifier qu'aucune donnée n'y est rattachée. | 🔴 | P1.2 |
| P2.5 | **Modèle A** : rétablir `KernelOrganization` (organisation unique) pour la comptabilité et les ressources véhicules, depuis `f9069cf` ; supprimer `/api/kernel/admin/organizations/{schoolId}` (une organisation par école, contraire au modèle) | 🔴 | P1.1 |
| T.1 | Mettre en place l'**agent de relecture de PR** (voir section 6) | 🟠 | P1.1 |
| F.5 | **Dette front** (voir finitions) | 🟢 | — |
| F.8 | **Documentation** (voir finitions) | 🟢 | — |

### Owen : séances et connexion

| ID | Tâche | Crit. | Dépend de |
|---|---|---|---|
| P2.2 | **Retour au modèle web des séances** (le plus gros chantier) | 🔴 | P1.1 |
| P2.4 | **Connexion et Google** | 🟠 | P2.1 |
| F.2a | Écrans gérant : modifier une offre (sans moniteurs), retirer un module d'une offre, changer le statut d'une promotion | 🟢 | P2.2 |
| F.4 | Libellés « promotion » et élèves d'une séance (espace moniteur) | 🟢 | — |
| F.7a | App mobile : contrats de P2.2 (séance = `enrollmentId` + `monitorId`) et P2.4 (Google) | 🟠 | P2.2, P2.4 |

**P2.2 en détail**

*Backend :*
- `CreateSessionRequest` : `enrollmentId` obligatoire, `monitorId` unique (fin de `offerIds` / `monitorIds`).
- Contrôle « pas assez d'heures restantes » à la création.
- À la clôture, débit sur l'inscription de la séance seulement.
- `getSessionsForStudent` limité aux séances de l'élève.
- Durée : arrondi à l'heure, minimum 1 h, fin ≤ début refusée.
- Suppression des moniteurs par offre (`offer_monitors`, `OfferMonitor`, `monitorIds` sur les offres) par une nouvelle migration.
- **Archivage** des séances collectives existantes (sans `enrollment_id`) : statut ou table d'archive, pas de suppression.
- **Chat** : recâbler les contacts (ils dépendaient des moniteurs par offre) sur séances et inscriptions, et ajouter le contrôle du destinataire (on n'écrit qu'à ses contacts).

*Front web :*
- Planning refait : choix de l'élève, puis du moniteur.
- Guidage « créez d'abord une promotion » quand aucune offre n'est disponible, avec un lien.
- Boutons **annuler** et **clôturer** une séance (notes pédagogiques).

*Tests :* heures insuffisantes, débit, durée, périmètre école, archivage, destinataire du chat.

**P2.4 en détail**
- Corriger le compte orphelin : à l'inscription, si le Kernel exige la vérification, le compte local existe mais l'utilisateur reçoit une erreur, et un nouvel essai renvoie « Email already exists ». Il faut un message clair et un parcours de renvoi de l'email.
- Login Google : vérifier `email_verified` ; bouton Google sur le web (le client ID existe déjà, autoriser l'origine web dans la console Google).
- ⚠️ Vérifier **avant** que le fournisseur d'email du Kernel est configuré en prod. Sinon, plus aucun nouvel inscrit ne peut se connecter.

### Japhet : rôles, paiement et comptes

| ID | Tâche | Crit. | Dépend de |
|---|---|---|---|
| P2.1 | **Rôles** | 🔴 | P1.1 |
| P2.3 | **Paiement** | 🔴 | P2.1 |
| F.1 | **Remonter les vraies erreurs** dans le front — **à faire en premier**, vague 0 | 🟠 | — |
| F.6 | Moniteur : retirer la modification de l'email et du mot de passe par le gérant, et faire l'écran de modification des informations | 🟠 | — |
| F.3 | Profil éditable pour tous les rôles | 🟢 | — |
| F.2b | Écrans gérant : modifier un véhicule et voir son historique, modérer les avis | 🟢 | — |
| F.7b | App mobile : contrat de P2.1 (inscription sans `STUDENT` ni `MONITOR`) | 🟠 | P2.1 |

**P2.1 en détail**
- Cycle `VISITOR` → `CANDIDAT` → `STUDENT`, avec le passage en `STUDENT` à la **confirmation du paiement** (`finalizePaid` et confirmation manuelle), et non plus à la création de l'inscription.
- `register` : refuser `MONITOR` et `STUDENT`, et traiter `STUDENT` envoyé par l'app mobile comme `CANDIDAT` pendant une période de transition.
- Vérifier chaque contrôle de rôle (`SecurityConfig`, chat, layouts du front) pour les deux rôles apprenants.
- Tests.

**P2.3 en détail**
- **CASH** : ne pas appeler la passerelle (aujourd'hui il part chez MyCoolPay comme du Mobile Money) ; la facture reste PENDING jusqu'à la confirmation du gérant.
- Nouvelle tentative : interroger la passerelle sur la facture PENDING précédente **avant** de la passer en FAILED (si elle a été payée, la finaliser au lieu d'en créer une autre).
- Retirer le `e.printStackTrace()` et logger proprement.
- Vérifier le parcours complet carte et Mobile Money avec le Kernel (sur l'environnement de test Yowyob si disponible).
- Tests.

### Finitions (F.x) — détail

*Ex-bloc du groupe niveau 4, réparti entre les trois membres (responsable dans la dernière colonne). Les 🟢 passent après les tâches 🔴 / 🟠 du même responsable, et peuvent être reportés si le temps manque.*

| ID | Finition | Crit. | Responsable |
|---|---|---|---|
| F.1 | **Remonter les vraies erreurs** : remplacer les toasts génériques (« Création impossible »…) par le message renvoyé par le backend, sur toutes les pages. À faire **en premier** : c'est ce qui permettra de diagnostiquer les bugs de prod. | 🟠 | Japhet |
| F.2 | **Écrans gérant manquants** : modifier un moniteur (nom, téléphone, permis, **pas** l'email ni le mot de passe), modifier une offre (**sans** moniteurs, supprimés par P2.2), retirer un module d'une offre, modifier un véhicule et voir son historique de positions, changer le statut d'une promotion (en cours, terminée, annulée), modérer les avis (vérifier, supprimer). Les routes backend existent toutes. | 🟢 | Owen (offre, module, promotion) · Japhet (véhicule, avis ; moniteur avec F.6) |
| F.3 | **Profil éditable** pour tous les rôles (nom, téléphone) via `PUT /api/users/me` | 🟢 | Japhet |
| F.4 | **Libellés** : la page « Promotions » et son bouton « Nouvelle Session » créent une *période de formation*, à renommer « Nouvelle promotion ». Espace moniteur : afficher les élèves d'une séance (`GET /api/monitors/me/sessions/{id}/students`). **Ne pas toucher la page Planning** (refaite par P2.2). | 🟢 | Owen |
| F.5 | **Dette front** : corriger les 84 erreurs de lint, puis rendre le lint bloquant en CI ; un seul calcul de l'URL d'API (aujourd'hui copié dans 6 fichiers de `lib/`) ; compresser les images de `public/assets` (`texture-noise.jpg` fait 16 Mo) | 🟢 | David |
| F.6 | **Gérant : retirer la modification de l'email et du mot de passe d'un moniteur** côté backend (désynchronise le compte miroir Kernel) et la remplacer par une simple modification des informations | 🟠 | Japhet |
| F.7 | **App mobile** (`drissmanmobile/drissman-frontend`) : suivre les contrats de P2.1 (inscription sans `STUDENT` ni `MONITOR`), P2.2 (séance = `enrollmentId` + `monitorId`, plus de moniteurs par offre) et P2.4 (Google) | 🟠 | Owen (P2.2, P2.4) · Japhet (P2.1) |
| F.8 | **Documentation** : README à jour (le lien de dépôt est faux), archiver les guides obsolètes (`RAILWAY_DEPLOYMENT_GUIDE.md`, `VERCEL_DEPLOY_GUIDE.md`, `ONLINE_ACCESS_GUIDE.md`, `deployment_guide.md`) dans `docs/archive/` | 🟢 | David |

**Points de prudence** : F.6 touche aux comptes et au Kernel ; F.7 doit suivre les contrats au fur et à mesure des fusions de P2.

> **Numérotation des migrations** : la table `databasechangelog` de la prod contient déjà `055` à `061` (dépôt mobile). Toute nouvelle migration est numérotée **à partir de `070`**.

## 4. Ordre de passage

| Vague | David (lead) | Japhet | Owen |
|---|---|---|---|
| **0, maintenant** | P1.1, P1.2, P1.5, P1.6 | installation locale, **F.1** | installation locale, étude de P2.2 |
| **1** | P1.3, P1.4, P2.5, T.1 | P2.1 puis P2.3, F.7b | P2.2 |
| **2** | relecture, déploiement, F.5, F.8 | F.6, F.3, F.2b, renfort tests P2.2 | P2.4, F.2a, F.4, F.7a |
| **3** | phase 4 (ci-dessous) | phase 4 | phase 4 |

**Zones de conflit à surveiller** (plusieurs personnes dans les mêmes fichiers) :
- `AuthService` : P2.1 (Japhet) **avant** P2.4 (Owen).
- `PaymentService` et `EnrollmentAppService` : P2.1 et P2.3, la même personne (Japhet).
- `OfferService` / page Offres : P2.2 (Owen) retire les moniteurs par offre. Owen fait aussi l'écran de modification d'offre (F.2a), donc **sans** ce champ.
- `MonitorService` : F.6 (Japhet) et P2.2 (Owen, suppression des moniteurs par offre). Se coordonner.
- Fichiers front touchés par F.1 (Japhet, tous les toasts) : faire F.1 **en vague 0**, avant que les autres écrans bougent.
- Page Planning : réservée à P2.2.

## 5. Phase 4 — à attribuer à la fin de la phase 2

Fonctions web retirées par la fusion mobile, à réintroduire depuis `f9069cf`. Elles n'étaient pas encore actives côté Kernel.

| ID | Tâche | Crit. |
|---|---|---|
| P4.1 | **Gouvernance des écoles** : rejet motivé, statut REJECTED, miroir de la décision vers le Kernel | 🟠 |
| P4.2 | **KYC** : revue Super Admin des documents école et moniteur (Approuver / Rejeter). Inclure les migrations `048`/`049` (absentes du master, alors que le code de dépôt existe), et fusionner avec les « documents génériques » ajoutés par le mobile. | 🔴 |
| P4.3 | **HRM** : moniteur déclaré employé de l'organisation Kernel | 🟠 |
| P4.4 | **Yowyob Search** : indexation des écoles et des offres | 🟠 |
| P4.5 | **Wallet** (séquestre marketplace) | 🔴 |
| P4.6 | Avis : rétablir `GET /reviews/eligibility/{schoolId}` (le front l'appelle déjà) | 🟢 |
| P4.7 | Fusion du suivi GPS des séances avec les positions véhicules (miroir Kernel resource) ; décider du quiz (aujourd'hui des questions codées en dur) | 🟢 |

## 6. Agent de relecture des PR (tâche T.1)

Objectif : un premier passage automatique sur chaque PR, avant la relecture du lead : bugs, oubli de tests, secrets, migration modifiée, contrat cassé.

Proposition : [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action), déclenchée à l'ouverture et à chaque mise à jour d'une PR vers `develop`.
- **Prérequis** : une clé d'API Anthropic, stockée dans les secrets du dépôt (`ANTHROPIC_API_KEY`), et l'installation de l'application GitHub Claude sur le dépôt.
- La consigne de relecture s'appuie sur ce document, sur `CONTRIBUTING.md` et sur la checklist du modèle de PR.
- L'agent **commente**, il ne fusionne jamais. La décision reste au lead.

## 7. Définition de « terminé » pour une tâche

1. La PR cible `develop`, la CI est verte, et le lead l'a relue et approuvée.
2. Chaque règle métier modifiée a son test.
3. Si le contrat d'API change, le front web est à jour dans la même PR, et l'app mobile est mise à jour par la même personne (PR liée).
4. La ligne de ce document est mise à jour.
