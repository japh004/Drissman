# 🚂 Guide de Déploiement Backend sur Railway

Ce guide explique comment déployer le backend Spring Boot de Drissman sur Railway.

## 1. Création du projet sur Railway

1.  Connectez-vous à [Railway.app](https://railway.app/).
2.  Cliquez sur **+ New Project**.
3.  Sélectionnez **Deploy from GitHub repo**.
4.  Choisissez votre dépôt `aphelion-granule`.
5.  Lorsqu'on vous demande le dossier racine, **ne sélectionnez rien pour l'instant** (nous allons configurer Railway pour pointer sur le dossier `backend`).

## 2. Configuration du dossier Backend

1.  Une fois le projet créé, allez dans les **Settings** du service.
2.  Dans la section **General**, cherchez **Root Directory**.
3.  Entrez `/backend`.
4.  Railway détectera automatiquement le `Dockerfile` présent dans ce dossier.

## 3. Ajout des Bases de Données

Dans votre projet Railway, cliquez sur **+ New** :
1.  **Database** -> **Add PostgreSQL**.
2.  **Database** -> **Add Redis**.

## 4. Configuration des Variables d'Environnement

Allez dans l'onglet **Variables** de votre service backend et ajoutez les variables suivantes (Railway remplira automatiquement certaines valeurs si vous utilisez les variables de référence) :

| Variable | Valeur (Référence Railway) |
| :--- | :--- |
| `SPRING_DATASOURCE_URL` | `r2dbc:postgresql://${{Postgres.DATABASE_URL}}` |
| `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` |
| `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
| `SPRING_REDIS_HOST` | `${{Redis.REDISHOST}}` |
| `SPRING_REDIS_PORT` | `${{Redis.REDISPORT}}` |
| `SPRING_REDIS_PASSWORD` | `${{Redis.REDISPASSWORD}}` |
| `JWT_SECRET` | `votre_secret_tres_long_et_securise` |

> [!IMPORTANT]
> Notez l'utilisation de `r2dbc:postgresql://` dans l'URL de la base de données pour supporter le mode réactif du backend.

## 5. Liaison avec le Frontend (Vercel)

Une fois le backend déployé, Railway vous donnera une URL (ex: `https://backend-production-xxx.up.railway.app`).

1.  Allez sur votre projet **Vercel**.
2.  Allez dans **Settings** -> **Environment Variables**.
3.  Ajoutez `NEXT_PUBLIC_API_URL` avec votre URL Railway.
4.  Redéployez le frontend sur Vercel.

---
Besoin d'aide ? N'hésitez pas à me demander !
