# DLPZ Shortener - Raccourcisseur d'URLs

Un raccourcisseur d'URLs moderne et professionnel développé avec **Symfony** (backend) et **React** (frontend), utilisant un stockage JSON simple sans base de données.

## 🚀 Fonctionnalités

- **Raccourcissement d'URLs** : Transformez vos liens longs en codes courts de 6 caractères
- **Interface moderne** : Frontend React avec Tailwind CSS et thème sombre/clair
- **API RESTful** : Backend Symfony avec endpoints complets
- **Stockage JSON** : Aucune base de données requise, stockage dans `/data/urls.json`
- **Statistiques** : Compteur de clics pour chaque URL raccourcie
- **Gestion complète** : Création, consultation, suppression des URLs
- **Tests complets** : Couverture de tests unitaires et fonctionnels avec PHPUnit
- **Déploiement prêt** : Configuration Nginx pour VPS OVH

## 🛠️ Stack Technique

### Backend
- **Symfony 7.x** - Framework PHP moderne
- **PHP 8.1+** - Langage de programmation
- **JSON** - Stockage des données (aucune base de données)
- **PHPUnit** - Tests unitaires et fonctionnels
- **Validator** - Validation des URLs

### Frontend
- **React 18** - Bibliothèque UI
- **Vite** - Build tool moderne
- **Tailwind CSS** - Framework CSS utilitaire
- **React Helmet** - Gestion du SEO
- **Context API** - Gestion d'état

## 📋 Prérequis

- PHP 8.1 ou supérieur
- Composer
- Node.js 18+ et npm
- Serveur web (Apache/Nginx) pour la production

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/votre-username/dlpz-shortener.git
cd dlpz-shortener
```

### 2. Configuration du Backend

```bash
cd backend

# Installer les dépendances PHP
composer install

# Copier le fichier d'environnement
cp env.example .env

# Éditer le fichier .env avec vos paramètres
nano .env
```

Configuration du fichier `.env` :
```env
APP_ENV=dev
APP_SECRET=your-secret-key-here
BASE_URL=https://dlpz.fr
SHORT_CODE_LENGTH=6
SERVER_PORT=3002
```

### 3. Configuration du Frontend

```bash
# Retourner à la racine du projet
cd ..

# Installer les dépendances Node.js
npm install

# Copier le fichier d'environnement
cp env.example .env.development
```

Configuration du fichier `.env.development` :
```env
VITE_API_URL=http://localhost:8000
```

### 4. Lancer le développement

```bash
# Lancer le serveur de développement (backend + frontend)
npm run dev
```

Ou séparément :

```bash
# Backend Symfony
cd backend
symfony serve -d

# Frontend React
npm run dev
```

## 🧪 Tests

### Lancer tous les tests

```bash
cd backend
php bin/phpunit
```

### Tests avec couverture

```bash
php bin/phpunit --coverage-html coverage/
```

### Tests spécifiques

```bash
# Tests unitaires uniquement
php bin/phpunit tests/Service/
php bin/phpunit tests/Repository/
php bin/phpunit tests/Entity/

# Tests fonctionnels uniquement
php bin/phpunit tests/Controller/
```

## 📚 API Documentation

### Endpoints disponibles

#### POST `/api/shorten`
Raccourcir une URL.

**Body :**
```json
{
  "url": "https://example.com"
}
```

**Réponse :**
```json
{
  "shortUrl": "https://dlpz.fr/abc123"
}
```

#### GET `/api/urls`
Récupérer toutes les URLs raccourcies.

**Réponse :**
```json
[
  {
    "code": "abc123",
    "original": "https://example.com",
    "createdAt": "2025-01-18T12:00:00Z",
    "clicks": 0
  }
]
```

#### GET `/{code}`
Rediriger vers l'URL originale (incrémente le compteur de clics).

**Réponse :** Redirection HTTP 301

#### DELETE `/api/urls/{code}`
Supprimer une URL raccourcie.

**Réponse :**
```json
{
  "deleted": true
}
```

#### GET `/api/urls/{code}/stats`
Récupérer les statistiques d'une URL.

**Réponse :**
```json
{
  "code": "abc123",
  "original": "https://example.com",
  "createdAt": "2025-01-18T12:00:00Z",
  "clicks": 5
}
```

#### GET `/api/health`
Vérifier la santé de l'API.

**Réponse :**
```json
{
  "status": "OK",
  "timestamp": "2025-01-18 12:00:00",
  "service": "URL Shortener API"
}
```

### Exemples avec cURL

```bash
# Raccourcir une URL
curl -X POST http://localhost:8000/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Récupérer toutes les URLs
curl http://localhost:8000/api/urls

# Supprimer une URL
curl -X DELETE http://localhost:8000/api/urls/abc123

# Vérifier la santé
curl http://localhost:8000/api/health
```

## 🏗️ Structure du Projet

```
dlpz-shortener/
├── backend/                 # Backend Symfony
│   ├── src/
│   │   ├── Controller/      # Contrôleurs API
│   │   ├── Entity/         # Entités métier
│   │   ├── Repository/     # Couche de données
│   │   └── Service/        # Logique métier
│   ├── tests/              # Tests PHPUnit
│   ├── data/               # Stockage JSON
│   └── config/             # Configuration Symfony
├── src/                    # Frontend React
│   ├── components/         # Composants React
│   ├── hooks/             # Hooks personnalisés
│   ├── contexts/          # Contextes React
│   └── config/            # Configuration API
├── public/                # Assets statiques
├── nginx/                 # Configuration Nginx
└── scripts/               # Scripts de déploiement
```

## 🚀 Déploiement sur VPS OVH

### 1. Préparation du serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer PHP 8.1+
sudo apt install php8.1-fpm php8.1-cli php8.1-common php8.1-mbstring php8.1-xml php8.1-curl php8.1-zip

# Installer Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer Nginx
sudo apt install nginx
```

### 2. Configuration Nginx

Copier le fichier de configuration :

```bash
sudo cp nginx/dlpz.fr.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/dlpz.fr.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 3. Déploiement de l'application

```bash
# Cloner le projet
git clone https://github.com/votre-username/dlpz-shortener.git /var/www/dlpz.fr
cd /var/www/dlpz.fr

# Configuration backend
cd backend
composer install --no-dev --optimize-autoloader
cp env.example .env
# Éditer .env avec les paramètres de production

# Configuration frontend
cd ..
npm install
npm run build

# Permissions
sudo chown -R www-data:www-data /var/www/dlpz.fr
sudo chmod -R 755 /var/www/dlpz.fr
```

### 4. Configuration SSL (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d dlpz.fr -d www.dlpz.fr
```

## 🔧 Configuration Avancée

### Variables d'environnement

#### Backend (.env)
```env
APP_ENV=prod
APP_SECRET=your-super-secret-key-here
BASE_URL=https://dlpz.fr
SHORT_CODE_LENGTH=6
SERVER_PORT=3002
```

#### Frontend (.env.production)
```env
VITE_API_URL=https://dlpz.fr
```

### Personnalisation

- **Longueur des codes** : Modifier `SHORT_CODE_LENGTH` dans `.env`
- **URL de base** : Modifier `BASE_URL` dans `.env`
- **Thème** : Personnaliser les couleurs dans `tailwind.config.js`

## 📊 Monitoring et Logs

### Logs de l'application

```bash
# Logs Symfony
tail -f backend/var/log/dev.log

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Monitoring des performances

```bash
# Vérifier l'utilisation des ressources
htop
df -h
free -h
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👨‍💻 Auteur

**Dorian Lopez**
- GitHub: [@winvdaking](https://github.com/winvdaking)
- LinkedIn: [winvdaking](https://linkedin.com/in/winvdaking)
- Site: [dorianlopez.fr](https://dorianlopez.fr)

## 🙏 Remerciements

- Symfony pour le framework backend
- React pour la bibliothèque frontend
- Tailwind CSS pour le framework CSS
- PHPUnit pour les tests

---

⭐ N'hésitez pas à donner une étoile si ce projet vous a aidé !