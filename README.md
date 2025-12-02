# Shop Admin Front – Interface d’administration
Frontend React (Vite + TypeScript) pour l’application **Shop Admin**.  
Cette interface permet de se connecter, de consulter les produits et, pour les administrateurs, de gérer le catalogue via l’API NestJS sécurisée.

---

## Rôle de l’application

- Connexion d’un utilisateur via email / mot de passe.
- Stockage local des tokens (`accessToken`, `refreshToken`) et des informations utilisateur.
- Affichage de la liste des produits (lecture publique).
- Accès à des actions protégées (création / modification / suppression de produits) pour les comptes ayant le rôle `admin`.
- Affichage du profil utilisateur en consommant `/auth/profile`.

Le front communique avec le backend via un client Axios configuré dans `src/api/client.ts` :

- Ajout automatique du header `Authorization: Bearer <accessToken>`.
- Gestion automatique du `refreshToken` en cas de réponse `401`.

---

## Déploiement en ligne

- Frontend : `https://api-front-k1nhgt6pj-semmaches-projects.vercel.app`
- Backend API : `https://api-back-umber.vercel.app/api/v1`

Le CORS côté backend est configuré pour n’autoriser que cette URL de frontend.

---

## Installation et lancement en local

### Prérequis

- Node.js (version récente, 18+ recommandé)
- npm
- Backend NestJS démarré en local (ou déployé en ligne)

### Installation

Depuis le dossier `api-front` :

```bash
npm install
```

### Configuration de l’URL de l’API

Le front utilise la variable d’environnement `VITE_API_URL` pour connaître l’URL de l’API.

Créer un fichier `.env` dans `api-front` (non commité) :

```env
VITE_API_URL=http://localhost:3000/api/v1
```

En production sur Vercel, cette valeur est configurée dans les variables d’environnement du projet.

### Démarrage en développement

```bash
npm run dev
```

Puis ouvrir l’URL indiquée par Vite (par défaut `http://localhost:5173`).

---

## Aperçu des pages

- Login : formulaire de connexion (email, mot de passe) qui appelle `/auth/login`.
- Produits : liste des produits exposés par `/products`.
- Profil : informations de l’utilisateur courant via `/auth/profile`.

Les routes protégées côté front s’appuient sur le contexte d’authentification défini dans `src/auth/AuthContext.tsx`.

---

## Lien avec le backend

Ce frontend est conçu pour fonctionner avec l’API NestJS du dossier `api-back` :

- Authentification JWT + refresh token.
- Ressource `Product` avec CRUD complet.
- Documentation Swagger disponible à `https://api-back-umber.vercel.app/api/docs`.


```
