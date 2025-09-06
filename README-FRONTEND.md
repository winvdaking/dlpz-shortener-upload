# Frontend dlpz.fr

Frontend React pour le service de raccourcissement d'URL et d'upload de fichiers dlpz.fr.

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+
- npm ou yarn
- Backend dlpz.fr en cours d'exécution sur le port 3002

### Installation

1. **Installer les dépendances :**

```bash
npm install
```

2. **Configurer l'environnement :**

```bash
# Copier le fichier d'exemple
cp env.example .env

# Modifier .env si nécessaire
# VITE_API_URL=http://localhost:3002
```

3. **Démarrer le serveur de développement :**

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 🔧 Configuration

### Variables d'environnement

- `VITE_API_URL` : URL du backend (défaut: `http://localhost:3002`)
- `VITE_NODE_ENV` : Environnement (development/production)
- `VITE_BASE_URL` : URL de base de l'application

### Proxy de développement

En mode développement, Vite configure automatiquement un proxy pour rediriger les requêtes `/api/*` vers le backend sur le port 3002.

## 📁 Structure du projet

```
src/
├── components/          # Composants React
│   ├── hero.jsx        # Composant principal
│   ├── SEO.jsx         # Gestion SEO
│   └── theme-toggle.jsx # Basculeur de thème
├── config/             # Configuration
│   └── api.js          # Configuration API
├── contexts/           # Contextes React
│   └── ThemeContext.jsx # Contexte de thème
├── hooks/              # Hooks personnalisés
│   └── useApi.js       # Hooks pour les appels API
├── lib/                # Utilitaires
│   └── utils.js        # Fonctions utilitaires
└── App.jsx             # Composant principal
```

## 🔌 Intégration avec le backend

### Configuration API

Le frontend utilise le fichier `src/config/api.js` pour gérer les appels au backend :

- **URL de base** : Configurée automatiquement selon l'environnement
- **Endpoints** : Tous les endpoints du backend sont définis
- **Gestion d'erreur** : Gestion centralisée des erreurs API

### Hooks personnalisés

- `useUrlShortener()` : Gestion du raccourcissement d'URL
- `useFileUpload()` : Gestion de l'upload de fichiers
- `useApiHealth()` : Vérification de la santé de l'API

### Exemple d'utilisation

```javascript
import { useUrlShortener } from "./hooks/useApi";

function MyComponent() {
  const { isLoading, error, result, shorten } = useUrlShortener();

  const handleShorten = async () => {
    await shorten("https://example.com");
  };

  return (
    <div>
      <button onClick={handleShorten} disabled={isLoading}>
        {isLoading ? "Raccourcissement..." : "Raccourcir"}
      </button>
      {error && <p>Erreur: {error}</p>}
      {result && <p>URL raccourcie: {result}</p>}
    </div>
  );
}
```

## 🎨 Fonctionnalités

### Raccourcissement d'URL

- ✅ Interface intuitive
- ✅ Validation des URLs
- ✅ Gestion d'erreur
- ✅ Copie en un clic

### Upload de fichiers

- ✅ Drag & drop
- ✅ Sélection de fichiers
- ✅ Compression automatique (backend)
- ✅ Prévisualisation des images
- ✅ Téléchargement sécurisé

### Interface utilisateur

- ✅ Design moderne et responsive
- ✅ Thème sombre/clair
- ✅ Animations fluides
- ✅ Optimisations de performance

## 🔒 Sécurité

Le frontend est conçu pour fonctionner avec le backend sécurisé :

- **Validation côté client** : Validation des entrées utilisateur
- **Sanitisation** : Nettoyage des données avant envoi
- **Gestion d'erreur** : Affichage sécurisé des messages d'erreur
- **CORS** : Configuration appropriée pour la communication avec le backend

## 🚀 Déploiement

### Build de production

```bash
npm run build
```

### Variables d'environnement de production

```bash
# .env.production
VITE_API_URL=https://api.dlpz.fr
VITE_NODE_ENV=production
VITE_BASE_URL=https://dlpz.fr
```

### Serveur de production

```bash
npm run preview
```

## 🐛 Dépannage

### Problèmes courants

1. **Erreur de connexion au backend**

   - Vérifier que le backend est démarré sur le port 3002
   - Vérifier la configuration CORS du backend

2. **Erreur de proxy en développement**

   - Redémarrer le serveur de développement
   - Vérifier la configuration du proxy dans `vite.config.js`

3. **Erreurs de build**
   - Nettoyer le cache : `npm run build -- --force`
   - Vérifier les variables d'environnement

### Logs de débogage

```bash
# Mode développement avec logs détaillés
npm run dev -- --debug

# Vérifier la santé de l'API
curl http://localhost:3002/api/health
```

## 📝 Scripts disponibles

- `npm run dev` : Serveur de développement
- `npm run build` : Build de production
- `npm run preview` : Prévisualisation du build
- `npm run lint` : Vérification du code

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request
