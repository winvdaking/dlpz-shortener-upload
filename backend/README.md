# Backend dlpz.fr

Backend sécurisé pour le service de raccourcissement d'URL et d'upload de fichiers dlpz.fr.

## Fonctionnalités

- ✅ Raccourcissement d'URL avec stockage JSON
- ✅ Upload de fichiers avec compression automatique
- ✅ Compression d'images sans perte de qualité
- ✅ Système de redirection pour les URLs raccourcies
- ✅ Statistiques et analytics
- ✅ **Sécurité renforcée** contre les exécutions malveillantes
- ✅ Validation stricte des fichiers uploadés
- ✅ Sanitisation des entrées utilisateur
- ✅ Rate limiting et protection DDoS
- ✅ Headers de sécurité stricts
- ✅ Support multi-fichiers

## 🔒 Sécurité

Ce backend est conçu avec une approche de sécurité "zero-trust" :

### Protection contre les exécutions malveillantes

- **Validation stricte des types de fichiers** : Seuls les types autorisés sont acceptés
- **Analyse du contenu** : Détection automatique de code malveillant dans les fichiers
- **Extensions interdites** : Blocage des extensions dangereuses (.exe, .php, .js, etc.)
- **Noms de fichiers sécurisés** : Validation des noms de fichiers contre les injections

### Validation des fichiers

- **Types MIME vérifiés** : Correspondance stricte entre extension et type MIME
- **Taille limitée** : Limites de taille par type de fichier
- **Contenu analysé** : Détection de patterns malveillants dans le contenu
- **Images validées** : Vérification avec Sharp pour s'assurer que c'est une vraie image

### Protection des URLs

- **URLs privées bloquées** : Interdiction des redirections vers localhost/IPs privées
- **Domaines suspects filtrés** : Blocage des services de raccourcissement d'URL
- **Sanitisation** : Nettoyage automatique des URLs

### Rate Limiting

- **Limites par endpoint** : Restrictions différentes selon le type d'opération
- **Protection DDoS** : Limitation du nombre de requêtes par IP
- **Uploads limités** : Maximum 10 uploads par heure par IP

## Installation

1. Installer les dépendances :

```bash
npm install
```

2. Copier le fichier de configuration :

```bash
cp env.example .env
```

3. Modifier les variables d'environnement dans `.env` selon vos besoins.

4. Démarrer le serveur :

```bash
# Mode développement (sans vérifications de sécurité)
npm run dev

# Mode production sécurisé (avec vérifications)
npm start

# Vérifications de sécurité uniquement
npm run security-check

# Mode production sans vérifications (non recommandé)
npm run start:unsafe
```

## API Endpoints

### URLs

- `POST /api/url/shorten` - Raccourcir une URL
- `GET /api/url/:shortId` - Obtenir les infos d'une URL raccourcie
- `GET /api/url/stats/all` - Statistiques des URLs
- `DELETE /api/url/:shortId` - Supprimer une URL

### Upload

- `POST /api/upload` - Upload de fichiers
- `GET /api/upload/download/:fileId` - Télécharger un fichier
- `GET /api/upload/info/:fileId` - Infos d'un fichier
- `GET /api/upload/stats` - Statistiques des uploads
- `DELETE /api/upload/:fileId` - Supprimer un fichier

### Autres

- `GET /:shortId` - Redirection vers l'URL originale
- `GET /api/health` - Statut du serveur

## Structure des données

### URLs (data/urls.json)

```json
{
  "abc123": {
    "originalUrl": "https://example.com",
    "shortId": "abc123",
    "clicks": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "lastAccessed": null,
    "ip": "127.0.0.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Fichiers (data/files.json)

```json
{
  "def456": {
    "fileId": "def456",
    "originalName": "image.jpg",
    "filename": "abc123def456.jpg",
    "mimetype": "image/jpeg",
    "size": 1024000,
    "path": "/uploads/images/abc123def456.jpg",
    "isImage": true,
    "compression": {
      "compressed": true,
      "originalSize": 1024000,
      "compressedSize": 512000,
      "compressionRatio": 50
    },
    "uploadDate": "2024-01-01T00:00:00.000Z",
    "downloads": 0,
    "lastAccessed": null
  }
}
```

## Configuration

### Variables d'environnement

- `PORT` : Port du serveur (défaut: 3002)
- `NODE_ENV` : Environnement (development/production)
- `FRONTEND_URL` : URL du frontend pour CORS
- `RATE_LIMIT_WINDOW_MS` : Fenêtre de rate limiting (ms)
- `RATE_LIMIT_MAX_REQUESTS` : Nombre max de requêtes par fenêtre
- `MAX_FILE_SIZE` : Taille max des fichiers (bytes)
- `MAX_FILES_PER_REQUEST` : Nombre max de fichiers par requête

### Types de fichiers supportés

**Images :** JPEG, PNG, GIF, WebP, SVG
**Documents :** PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
**Archives :** ZIP, RAR, 7Z
**Texte :** TXT, CSV
**Code :** JSON, JS, CSS, HTML
**Média :** MP3, WAV, MP4, WebM

## Sécurité

- Rate limiting (100 requêtes/15min par IP)
- Validation des types de fichiers
- Limitation de taille des fichiers (50MB max)
- Headers de sécurité avec Helmet
- Validation des URLs
- Nettoyage automatique des fichiers en cas d'erreur

## Compression d'images

Les images sont automatiquement compressées avec Sharp :

- Qualité ajustée selon la taille (80-90%)
- Redimensionnement si > 2048px
- Formats optimisés (JPEG, PNG, WebP)
- Conservation de la qualité visuelle

## Déploiement

1. Configurer les variables d'environnement
2. Installer les dépendances : `npm install --production`
3. Démarrer le serveur : `npm start`

Le serveur créera automatiquement les dossiers nécessaires :

- `uploads/images/` - Images uploadées
- `uploads/files/` - Autres fichiers
- `data/` - Fichiers JSON de stockage
