# DLPZ Shortener - Frontend React

Interface utilisateur moderne pour le raccourcissement d'URLs, développée avec React et Tailwind CSS.

## 🎨 Fonctionnalités Frontend

- **Interface moderne** : Design épuré avec Tailwind CSS
- **Thème sombre/clair** : Basculement automatique selon les préférences système
- **Responsive** : Compatible mobile, tablette et desktop
- **Composants réutilisables** : Architecture modulaire
- **Gestion d'état** : Context API pour les thèmes et alertes
- **Hooks personnalisés** : Logique métier encapsulée
- **SEO optimisé** : Meta tags et structured data

## 🛠️ Technologies

- **React 18** - Bibliothèque UI
- **Vite** - Build tool et serveur de développement
- **Tailwind CSS** - Framework CSS utilitaire
- **React Helmet** - Gestion du SEO
- **Context API** - Gestion d'état global

## 📁 Structure des Composants

```
src/
├── components/           # Composants React
│   ├── UrlForm.jsx      # Formulaire de raccourcissement
│   ├── UrlList.jsx      # Liste des URLs
│   ├── UrlItem.jsx      # Élément d'URL individuel
│   ├── SEO.jsx          # Gestion du SEO
│   ├── AlertContainer.jsx # Gestion des alertes
│   └── theme-toggle.jsx # Basculeur de thème
├── contexts/            # Contextes React
│   ├── ThemeContext.jsx # Gestion du thème
│   └── AlertContext.jsx # Gestion des alertes
├── hooks/               # Hooks personnalisés
│   └── useApi.js        # Hooks pour les appels API
├── config/              # Configuration
│   └── api.js           # Configuration API
└── ui/                  # Composants UI de base
    └── button.jsx       # Composant bouton
```

## 🚀 Installation et Développement

### Prérequis

- Node.js 18+
- npm ou yarn

### Installation

```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

### Scripts disponibles

```bash
# Développement
npm run dev          # Serveur de développement Vite

# Build
npm run build        # Build de production
npm run preview      # Prévisualiser le build

# Linting
npm run lint         # Vérifier le code
npm run lint:fix     # Corriger automatiquement
```

## 🎨 Personnalisation

### Thème et Couleurs

Les couleurs sont définies dans `tailwind.config.js` :

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          // ...
        }
      }
    }
  }
}
```

### Composants UI

Les composants de base sont dans `src/ui/` et peuvent être personnalisés :

```jsx
// Exemple de personnalisation du bouton
<Button 
  variant="primary" 
  size="lg" 
  className="custom-class"
>
  Mon bouton
</Button>
```

## 🔧 Configuration API

La configuration API se trouve dans `src/config/api.js` :

```javascript
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  ENDPOINTS: {
    URL_SHORTEN: '/api/shorten',
    URL_INFO: '/api/urls',
    // ...
  }
};
```

### Variables d'environnement

Créer un fichier `.env.development` :

```env
VITE_API_URL=http://localhost:8000
```

## 📱 Responsive Design

Le design est entièrement responsive avec des breakpoints Tailwind :

- **Mobile** : `< 640px`
- **Tablette** : `640px - 1024px`
- **Desktop** : `> 1024px`

### Exemples de classes responsive

```jsx
<div className="
  flex flex-col          // Mobile : colonne
  sm:flex-row           // Tablette+ : ligne
  gap-4                 // Espacement
  p-4                   // Padding mobile
  sm:p-6                // Padding tablette+
">
```

## 🌙 Gestion des Thèmes

Le système de thème utilise le Context API :

```jsx
import { useTheme } from './contexts/ThemeContext';

function MyComponent() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className={`
      ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}
      ${theme === 'dark' ? 'text-white' : 'text-gray-900'}
    `}>
      <button onClick={toggleTheme}>
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
    </div>
  );
}
```

## 🔔 Système d'Alertes

Gestion des notifications avec le Context API :

```jsx
import { useAlert } from './contexts/AlertContext';

function MyComponent() {
  const { showSuccess, showError } = useAlert();
  
  const handleSubmit = async () => {
    try {
      await apiCall();
      showSuccess('Opération réussie !');
    } catch (error) {
      showError('Une erreur est survenue');
    }
  };
}
```

## 🎯 Hooks Personnalisés

### useUrlShortener

Hook pour le raccourcissement d'URLs :

```jsx
import { useUrlShortener } from './hooks/useApi';

function UrlForm() {
  const { shorten, isLoading, result } = useUrlShortener();
  
  const handleSubmit = async (url) => {
    await shorten(url);
  };
}
```

### useUrlManager

Hook pour la gestion des URLs :

```jsx
import { useUrlManager } from './hooks/useApi';

function UrlList() {
  const { urls, loadUrls, removeUrl } = useUrlManager();
  
  useEffect(() => {
    loadUrls();
  }, []);
}
```

## 🔍 SEO et Meta Tags

Le composant SEO gère automatiquement les meta tags :

```jsx
import SEO from './components/SEO';

function App() {
  return (
    <>
      <SEO 
        title="Mon titre personnalisé"
        description="Ma description"
      />
      {/* Contenu de l'app */}
    </>
  );
}
```

## 📊 Performance

### Optimisations implémentées

- **Lazy loading** : Composants chargés à la demande
- **Memoization** : useCallback et useMemo pour éviter les re-renders
- **Code splitting** : Séparation du code par routes
- **Tree shaking** : Élimination du code mort

### Métriques

```bash
# Analyser le bundle
npm run build
npm run preview

# Vérifier les performances
npm run analyze
```

## 🧪 Tests

### Tests unitaires (optionnel)

```bash
# Installer les dépendances de test
npm install --save-dev @testing-library/react @testing-library/jest-dom

# Lancer les tests
npm test
```

### Tests E2E (optionnel)

```bash
# Installer Playwright
npm install --save-dev @playwright/test

# Lancer les tests E2E
npx playwright test
```

## 🚀 Déploiement

### Build de production

```bash
# Build optimisé
npm run build

# Les fichiers sont générés dans dist/
```

### Variables d'environnement de production

Créer `.env.production` :

```env
VITE_API_URL=https://dlpz.fr
```

### Intégration avec le backend

Le frontend est conçu pour être servi par le même serveur que le backend Symfony :

```nginx
# Configuration Nginx
location / {
    try_files $uri $uri/ /index.html;
}

location /api/ {
    # Proxy vers Symfony
    proxy_pass http://127.0.0.1:8000;
}
```

## 🐛 Débogage

### Outils de développement

- **React DevTools** : Extension navigateur
- **Vite DevTools** : Outils intégrés Vite
- **Tailwind CSS IntelliSense** : Extension VS Code

### Console et logs

```javascript
// Logs conditionnels
if (import.meta.env.DEV) {
  console.log('Debug info:', data);
}
```

## 📚 Ressources

- [Documentation React](https://react.dev/)
- [Documentation Vite](https://vitejs.dev/)
- [Documentation Tailwind CSS](https://tailwindcss.com/)
- [React Helmet](https://github.com/nfl/react-helmet)

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

---

Pour plus d'informations sur le backend, consultez le [README principal](../README.md).